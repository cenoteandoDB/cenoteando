import axios, { AxiosError } from 'axios';
import Store from '@/store';
import router from '@/router';
import IdentifyDTO from '@/models/oai/IdentifyDTO';
import { ElementCompact, xml2js } from 'xml-js';
import CenoteDTO from '@/models/CenoteDTO';
import L from 'leaflet';
import { FeatureCollection } from 'geojson';
import CommentDTO from '@/models/CommentDTO';
import AuthDto from '@/models/user/AuthDto';
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import VariableDTO from '@/models/VariableDTO';

const httpClient = axios.create();
httpClient.defaults.timeout = 100000;
httpClient.defaults.baseURL =
    process.env.VUE_APP_ROOT_API || 'http://localhost';
httpClient.defaults.headers.post['Content-Type'] = 'application/json';
httpClient.interceptors.request.use(
    (config) => {
        if (!config.headers['X-Session-Id']) {
            const token = Store.getters.getToken;

            if (token) {
                config.headers['X-Session-Id'] = token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);
httpClient.interceptors.response.use(
    (response) => {
        if (response.data.notification) {
            if (response.data.notification.errorMessages.length)
                Store.dispatch(
                    'notification',
                    response.data.notification.errorMessages,
                );
            response.data = response.data.response;
        }
        return response;
    },
    (error) => Promise.reject(error),
);

export default class RemoteServices {
    // Error

    static async errorMessage(error: AxiosError): Promise<string> {
        if (error.message === 'Network Error') {
            return 'Unable to connect to server';
        } else if (error.message.split(' ')[0] === 'timeout') {
            return 'Request timeout - Server took too long to respond';
        } else if (error.response?.data.errorMessage) {
            return error.response.data.errorMessage;
        } else if (error.message === 'Request failed with status code 403') {
            await router.push({ path: '/' });
            return 'Unauthorized access or expired token';
        } else {
            console.log(error);
            return 'Unknown Error - Contact admin';
        }
    }

    // Auth
    static async login(email: string, password: string): Promise<AuthDto> {
        return httpClient
            .post('/api/auth/login', { email, password })
            .then((response) => {
                return new AuthDto({
                    token: response.headers['x-session-id'],
                    user: response.data,
                });
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async signup(
        name: string,
        email: string,
        password: string,
    ): Promise<AuthDto> {
        return httpClient
            .post('/api/auth/register', { name, email, password })
            .then((response) => {
                return new AuthDto({
                    token: response.headers['x-session-id'],
                    user: response.data,
                });
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // OAI-PMH

    static async identify(): Promise<IdentifyDTO> {
        return httpClient
            .get('/oai/request?verb=Identify')
            .then((response) => {
                return new IdentifyDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getRecordXml(identifier: string): Promise<string> {
        return httpClient
            .get(
                '/oai/request?verb=GetRecord&metadataPrefix=oai_datacite&identifier=' +
                    identifier,
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async listRecords(): Promise<ElementCompact> {
        return httpClient
            .get('/oai/request?verb=ListRecords&metadataPrefix=oai_datacite')
            .then((response) => {
                return xml2js(response.data, { compact: true });
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // Variables
    static async *variablesGenerator(
        limit?: number,
    ): AsyncGenerator<VariableDTO[]> {
        let continuationToken: string | undefined = undefined;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/variables', {
                    params: { limit, continuationToken },
                });
                yield response.data.data.map((v) => new VariableDTO(v));
                hasMore = response.data.hasMore;
                continuationToken = response.data.continuationToken;
            }
        } catch (e) {
            throw Error(await this.errorMessage(e));
        }
    }

    // Cenotes
    static async *cenotesGenerator(
        limit?: number,
    ): AsyncGenerator<CenoteDTO[]> {
        let continuationToken: string | undefined = undefined;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/cenotes', {
                    params: { limit, continuationToken },
                });
                yield response.data.data.map((c) => new CenoteDTO(c));
                hasMore = response.data.hasMore;
                continuationToken = response.data.continuationToken;
            }
        } catch (e) {
            throw Error(await this.errorMessage(e));
        }
    }

    static async getCenote(key: string): Promise<CenoteDTO> {
        return httpClient
            .get('/api/cenotes/' + key)
            .then((response) => {
                return new CenoteDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getData(
        key: string,
        theme: string,
    ): Promise<VariableWithValuesDTO[]> {
        return httpClient
            .get('/api/cenotes/' + key + '/data/' + theme)
            .then((response) => {
                return Object.values(response.data).map(
                    (v) =>
                        new VariableWithValuesDTO(v as VariableWithValuesDTO),
                );
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getComments(key: string): Promise<CommentDTO[]> {
        return httpClient
            .get('/api/cenotes/' + key + '/comments/')
            .then((response) => {
                return response.data.data.map((v) => new CommentDTO(v));
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getCenotesBounds(): Promise<L.LatLngBounds> {
        return httpClient
            .get('/api/cenotes/bounds')
            .then((response) => {
                return new L.LatLngBounds(response.data.min, response.data.max);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    /* TODO: Not working, too heavy
    static getCoastline(): Promise<FeatureCollection> {
        return httpClient
            .get('/api/gadm/coastline')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static getStates(): Promise<FeatureCollection> {
        return httpClient
            .get('/api/gadm/states')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static getMunicipalities(): Promise<FeatureCollection> {
        return httpClient
            .get('/api/gadm/municipalities')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }
    */

    /* TODO: Not working due to CORS policy

    // TODO: Get this from database
    static async getProtectedNaturalAreas(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://raw.githubusercontent.com/luisyerbes20/yerbaa/main/areas_naturales.json',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // TODO: Get this from database
    static async getMinTemperature(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://raw.githubusercontent.com/luisyerbes20/yerbaa/main/temperatura_min.json',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // TODO: Get this from database
    static async getMaxTemperature(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://raw.githubusercontent.com/luisyerbes20/yerbaa/main/temperatura_max.json',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // TODO: Get this from database
    static async getRoads(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://github.com/luisyerbes20/yerbaa/blob/main/roads.json?raw=true',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // TODO: Get this from database
    static async getSoilType(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://github.com/luisyerbes20/yerbaa/blob/main/soil_type.json?raw=true',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // TODO: Get this from database
    static async getTermRegime(): Promise<FeatureCollection> {
        return httpClient
            .get(
                'https://github.com/luisyerbes20/yerbaa/blob/main/term_regime.json?raw=true',
            )
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }
    */

    /* TODO: get vegetation FeatureCollection
    static async getVegetation(): Promise<FeatureCollection> {
        return httpClient
            .get('')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }
    */
}

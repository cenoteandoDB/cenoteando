import CenoteDTO from '@/models/CenoteDTO';
import CommentBucketDTO from '@/models/CommentBucketDTO';
import IdentifyDTO from '@/models/oai/IdentifyDTO';
import ReferenceDTO from '@/models/ReferenceDTO';
import SpeciesDTO from '@/models/SpeciesDTO';
import AuthDto from '@/models/user/AuthDto';
import UserDTO from '@/models/UserDTO';
import VariableDTO from '@/models/VariableDTO';
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import MofsDTO from '@/models/MofsDTO';
import router from '@/router';
import Store from '@/store';
import axios, { AxiosError } from 'axios';
import L from 'leaflet';
import { ElementCompact, xml2js } from 'xml-js';

const httpClient = axios.create();
httpClient.defaults.timeout = 100000;
httpClient.defaults.baseURL =
    process.env.VUE_APP_ROOT_API || window.location.origin;
httpClient.defaults.headers.post['Content-Type'] = 'application/json';
httpClient.interceptors.request.use(
    (config) => {
        if (!config.headers['Authorization']) {
            const accessToken = Store.getters.getAccessToken;
            const tokenType = Store.getters.getTokenType;

            if (accessToken && tokenType) {
                config.headers['Authorization'] = tokenType + ' ' + accessToken;
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
                return new AuthDto(response.data);
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
                return new AuthDto(response.data);
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

    // Species
    static async *speciesGenerator(
        size?: number,
    ): AsyncGenerator<SpeciesDTO[]> {
        let page = 0;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/species', {
                    params: { size, page },
                });
                yield response.data.content.map((v) => new SpeciesDTO(v));
                hasMore = !response.data.last;
                page = response.data.number + 1;
            }
        } catch (e) {
            if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
            // TODO: Throw custom error
            else throw Error('Unkown error in SpeciesGenerator');
        }
    }

    static async createSpecie(variable: SpeciesDTO): Promise<SpeciesDTO> {
        return httpClient
            .post('/api/species/', variable)
            .then((response) => {
                return new SpeciesDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async updateSpecie(variable: SpeciesDTO): Promise<SpeciesDTO> {
        return httpClient
            .put('/api/species/' + variable.id, variable)
            .then((response) => {
                return new SpeciesDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async deleteSpecie(id: string): Promise<void> {
        httpClient.delete('/api/species/' + id).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async speciesToCsv(): Promise<string> {
        return httpClient
            .get('/api/species/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async csvToSpecies(
        files: File[],
        onUploadProgress: (Event) => void,
    ): Promise<SpeciesDTO[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        return httpClient
            .post('/api/species/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            })
            .then((response) => {
                return response.data.map((v) => new SpeciesDTO(v));
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // References
    static async *referencesGenerator(
        size?: number,
    ): AsyncGenerator<ReferenceDTO[]> {
        let page = 0;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/references', {
                    params: { size, page },
                });
                yield response.data.content.map((v) => new ReferenceDTO(v));
                hasMore = !response.data.last;
                page = response.data.number + 1;
            }
        } catch (e) {
            if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
            // TODO: Throw custom error
            else throw Error('Unkown error in ReferencesGenerator');
        }
    }

    static async createReference(
        reference: ReferenceDTO,
    ): Promise<ReferenceDTO> {
        return httpClient
            .post('/api/references/', reference)
            .then((response) => {
                return new ReferenceDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async updateReference(
        reference: ReferenceDTO,
    ): Promise<ReferenceDTO> {
        return httpClient
            .put('/api/references/' + reference.id, reference)
            .then((response) => {
                return new ReferenceDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async deleteReference(id: string): Promise<void> {
        httpClient.delete('/api/references/' + id).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async referencesToCsv(): Promise<string> {
        return httpClient
            .get('/api/references/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async referencesToCsvSingle(id: string): Promise<string> {
        return httpClient
            .get('/api/references/' + id + '/download')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async csvToReferences(
        files: File[],
        onUploadProgress: (Event) => void,
    ): Promise<ReferenceDTO[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        return httpClient
            .post('/api/references/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            })
            .then((response) => {
                return response.data.map((v) => new ReferenceDTO(v));
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // Variables
    static async *variablesGenerator(
        size?: number,
    ): AsyncGenerator<VariableDTO[]> {
        let page = 0;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/variables', {
                    params: { size, page },
                });
                yield response.data.content.map((v) => new VariableDTO(v));
                hasMore = !response.data.last;
                page = response.data.number + 1;
            }
        } catch (e) {
            if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
            // TODO: Throw custom error
            else throw Error('Unkown error in VariablesGenerator');
        }
    }

    static async createVariable(variable: VariableDTO): Promise<VariableDTO> {
        return httpClient
            .post('/api/variables/', variable)
            .then((response) => {
                return new VariableDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async updateVariable(variable: VariableDTO): Promise<VariableDTO> {
        return httpClient
            .put('/api/variables/' + variable.id, variable)
            .then((response) => {
                return new VariableDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async deleteVariable(id: string): Promise<void> {
        httpClient.delete('/api/variables/' + id).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async variablesToCsv(): Promise<string> {
        return httpClient
            .get('/api/variables/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async csvToVariables(
        files: File[],
        onUploadProgress: (Event) => void,
    ): Promise<VariableDTO[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        return httpClient
            .post('/api/variables/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            })
            .then((response) => {
                return response.data.map((v) => new VariableDTO(v));
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // Cenotes
    static async *cenotesGenerator(size?: number): AsyncGenerator<CenoteDTO[]> {
        let page = 0;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/cenotes', {
                    params: { size, page },
                });
                yield response.data.content.map((c) => new CenoteDTO(c));
                hasMore = !response.data.last;
                page = response.data.number + 1;
            }
        } catch (e) {
            if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
            // TODO: Throw custom error
            else throw Error('Unkown error in CenotesGenerator');
        }
    }

    static async createCenote(cenote: CenoteDTO): Promise<CenoteDTO> {
        return httpClient
            .post('/api/cenotes/', cenote)
            .then((response) => {
                return new CenoteDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
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

    static async updateCenote(cenote: CenoteDTO): Promise<CenoteDTO> {
        return httpClient
            .put('/api/cenotes/' + cenote.id, cenote)
            .then((response) => {
                return new CenoteDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async deleteCenote(id: string): Promise<void> {
        httpClient.delete('/api/cenotes/' + id).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async cenotesToCsv(): Promise<string> {
        return httpClient
            .get('/api/cenotes/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async csvToCenotes(
        files: File[],
        onUploadProgress: (Event) => void,
    ): Promise<CenoteDTO[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        return httpClient
            .post('/api/cenotes/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            })
            .then((response) => {
                return response.data.map((v) => new CenoteDTO(v));
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

    static async getComments(key: string): Promise<CommentBucketDTO> {
        return httpClient
            .get('/api/cenotes/' + key + '/comments/')
            .then((response) => {
                return new CommentBucketDTO(response.data);
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

    static async getPhotosCenotes(key: string): Promise<Array<string>> {
        return httpClient
            .get('/api/cenotes/' + key + '/photos')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getMapsCenotes(key: string): Promise<Array<string>> {
        return httpClient
            .get('/api/cenotes/' + key + '/maps')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getCenoteReferences(key: string): Promise<ReferenceDTO[]> {
        return httpClient
            .get('/api/cenotes/' + key + '/references')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    // Users
    static async *usersGenerator(limit?: number): AsyncGenerator<UserDTO[]> {
        let page = 0;
        let hasMore = true;
        try {
            while (hasMore) {
                const response = await httpClient.get('/api/users', {
                    params: { limit, page },
                });
                yield response.data.content.map((v) => new UserDTO(v));
                hasMore = !response.data.last;
                page = response.data.number + 1;
            }
        } catch (e) {
            if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
            // TODO: Throw custom error
            else throw Error('Unkown error in UsersGenerator');
        }
    }

    static async deleteUser(id: string): Promise<void> {
        httpClient.delete('/api/users/' + id).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async updateUser(user: UserDTO): Promise<UserDTO> {
        return httpClient
            .put('/api/users/' + user.id, user)
            .then((response) => {
                return new UserDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }


    //TODO: ADD ENDPOINT LATER

    // static async *mofsGenerator(
    //     size?: number,
    // ): AsyncGenerator<MofsDTO[]> {
    //     let page = 0;
    //     let hasMore = true;
    //     try {
    //         while (hasMore) {
    //             const response = await httpClient.get('/api/MeasurementsOrFacts', {
    //                 params: { size, page },
    //             });
    //             yield response.data.content.map((v) => new MofsDTO(v));
    //             hasMore = !response.data.last;
    //             page = response.data.number + 1;
    //         }
    //     } catch (e) {
    //         if (axios.isAxiosError(e)) throw Error(await this.errorMessage(e));
    //         // TODO: Throw custom error
    //         else throw Error('Unkown error in ReferencesGenerator');
    //     }
    // }

    static async createMofs(
        mof: VariableWithValuesDTO,
        key: string,
        theme: string,
    ): Promise<VariableWithValuesDTO> {
        return httpClient
            .post('/api/cenotes/' + key + '/data/' + theme, mof)
            .then((response) => {
                return new VariableWithValuesDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async updateMofs(
        mof: VariableWithValuesDTO,
        key: string,
        theme: string,
    ): Promise<VariableWithValuesDTO> {
        return httpClient
            .put('/api/cenotes/' + key + '/data/' + theme, mof)
            .then((response) => {
                return new VariableWithValuesDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async deleteMofs(key:string, theme: string): Promise<void> {
        httpClient.delete('/api/cenotes/' + key + '/data/' + theme).catch(async (error) => {
            throw Error(await this.errorMessage(error));
        });
    }

    static async MofsToCsv(): Promise<string> {
        return httpClient
            .get('/api/mof/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async MofsToCsvSingle(id: string): Promise<string> {
        return httpClient
            .get('/api/mof/' + id + '/csv')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async csvToMofs(
        files: File[],
        onUploadProgress: (Event) => void,
    ): Promise<VariableWithValuesDTO[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file);
        });

        return httpClient
            .post('/api/mof/csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            })
            .then((response) => {
                return response.data.data.map((v) => new MofsDTO(v));
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

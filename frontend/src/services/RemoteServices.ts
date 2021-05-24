import axios, { AxiosError } from 'axios';
import Store from '@/store';
import router from '@/router';
import IdentifyDTO from '@/models/oai/IdentifyDTO';
import { ElementCompact, xml2js } from 'xml-js';
import CenoteDTO from '@/models/CenoteDTO';
import L from 'leaflet';

const httpClient = axios.create();
httpClient.defaults.timeout = 100000;
httpClient.defaults.baseURL = 'http://localhost';
httpClient.defaults.headers.post['Content-Type'] = 'application/json';
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
        } else if (error.message === 'Request failed with status code 403') {
            await router.push({ path: '/' });
            return 'Unauthorized access or expired token';
        } else if (error.message.split(' ')[0] === 'timeout') {
            return 'Request timeout - Server took too long to respond';
        } else if (error.response) {
            return error.response.data.message;
        } else {
            console.log(error);
            return 'Unknown Error - Contact admin';
        }
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

    // Cenotes

    static async getAllCenotes(): Promise<Array<CenoteDTO>> {
        return httpClient
            .get('/api/cenotes')
            .then((response) => {
                return response.data;
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }

    static async getCenotesBounds(): Promise<L.LatLngBounds> {
        return httpClient
            .get('/api/cenotes/bounds')
            .then((response) => {
                return new L.LatLngBounds(response.data.result);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }
}

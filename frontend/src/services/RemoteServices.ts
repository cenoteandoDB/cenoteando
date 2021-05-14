import axios from 'axios';
import Store from '@/store';
import router from '@/router';
import ListIdentifiersDTO from '@/models/ListIdentifiersDTO';

const httpClient = axios.create();
httpClient.defaults.timeout = 100000;
httpClient.defaults.baseURL =
    process.env.VUE_APP_ROOT_API || 'http://localhost';
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

class RemoteServices {
    // Error

    // FIXME: any -> error type definition
    static async errorMessage(error: any): Promise<string> {
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

    static async listIdentifiers(): Promise<ListIdentifiersDTO> {
        return httpClient
            .get(
                '/oai/request?verb=ListIdentifiers&metadataPrefix=oai_datacite',
            )
            .then((response) => {
                return new ListIdentifiersDTO(response.data);
            })
            .catch(async (error) => {
                throw Error(await this.errorMessage(error));
            });
    }
}

export default RemoteServices;

import Vue from 'vue';
import Vuex from 'vuex';
import AuthDto from '@/models/user/AuthDto';
import RemoteServices from '@/services/RemoteServices';
import AuthUser from '@/models/user/AuthUser';
import CenoteDTO from './models/CenoteDTO';
import * as localforage from 'localforage';

// TODO: Get cenote updates from server (using HATEOAS?)

interface State {
    error: boolean;
    errorMessage: string;
    loading: boolean;
    user: AuthUser | null;
    accessToken: string;
    tokenType: string;
    expiry: number | null;
    cenotes: Array<CenoteDTO>;
    cenotesExpiry: number | null;
}

const state: State = {
    error: false,
    errorMessage: '',
    loading: false,
    user: null,
    accessToken: '',
    tokenType: '',
    expiry: null,
    cenotes: [],
    cenotesExpiry: null,
};

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
    state: state,
    mutations: {
        initializeStore(state) {
            validateSession();

            const user = localStorage.getItem('user');
            if (user) {
                state.user = JSON.parse(user);
            }

            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                state.accessToken = accessToken;
            }

            const tokenType = localStorage.getItem('tokenType');
            if (tokenType) {
                state.tokenType = tokenType;
            }

            const expiry = localStorage.getItem('expiry');
            if (expiry) {
                state.expiry = JSON.parse(expiry);
            }

            localforage.getItem('cenotes', (cenotes) => {
                state.cenotes = cenotes;
                return new CenoteDTO(cenotes);
            });

            localforage.getItem('cenotesExpiry', (cenotesExpiry) => {
                state.cenotesExpiry = cenotesExpiry;
                return cenotesExpiry;
            });

            // const cenotes = localStorage.getItem('cenotes');
            // if (cenotes) {
            //     state.cenotes = JSON.parse(cenotes);
            // }

            // try {
            //     const cenotes = await localforage.getItem(
            //         'cenotes',
            //         (cenotes) => {
            //             state.cenotes = cenotes;
            //             return new CenoteDTO(cenotes);
            //         },
            //     );

            //     console.log(cenotes);
            // } catch (err) {
            //     console.log(err);
            // }

            // const cenotesExpiry = localStorage.getItem('cenotesExpiry');
            // if (cenotesExpiry) {
            //      state.cenotes = JSON.parse(cenotesExpiry);
            // }
        },
        login(state, authResponse: AuthDto) {
            state.user = authResponse.user;
            localStorage.setItem('user', JSON.stringify(state.user));

            state.accessToken = authResponse.accessToken;
            localStorage.setItem('accessToken', state.accessToken);

            state.tokenType = authResponse.tokenType;
            localStorage.setItem('tokenType', state.tokenType);

            state.expiry = Date.now() + authResponse.expiresIn * 1000;
            localStorage.setItem('expiry', JSON.stringify(state.expiry));
        },
        logout() {
            clearSession();
        },
        error(state, errorMessage: string) {
            state.error = true;
            state.errorMessage = errorMessage;
        },
        clearError(state) {
            state.error = false;
            state.errorMessage = '';
        },
        loading(state) {
            state.loading = true;
        },
        clearLoading(state) {
            state.loading = false;
        },
        setCenotes(state, cenotes: CenoteDTO[]) {
            localforage.setItem('cenotes', cenotes);
            state.cenotesExpiry = Date.now() + 20 * 60 * 1000 /* 20 minutes */;
            localforage.setItem('cenoteExpiry', state.cenotesExpiry);
        },
    },
    actions: {
        error({ commit }, errorMessage) {
            commit('error', errorMessage);
        },
        clearError({ commit }) {
            commit('clearError');
        },
        loading({ commit }) {
            commit('loading');
        },
        clearLoading({ commit }) {
            commit('clearLoading');
        },
        async login({ commit }, { email, password }) {
            const authResponse = await RemoteServices.login(email, password);
            commit('login', authResponse);
        },
        async signup({ commit }, { name, email, password }) {
            const authResponse = await RemoteServices.signup(
                name,
                email,
                password,
            );
            commit('login', authResponse);
        },
        logout({ commit }) {
            commit('logout');
        },
        setCenotes({ commit }, cenotes) {
            commit('setCenotes', cenotes);
        },
    },
    getters: {
        isLoggedIn(state): boolean {
            validateSession();
            return !!state.accessToken;
        },
        isAdmin(state): boolean {
            validateSession();
            return (
                !!state.accessToken &&
                state.user !== null &&
                (state.user.admin || state.user.role == 'ADMIN')
            );
        },
        getAccessToken(state): string {
            validateSession();
            return state.accessToken;
        },
        getTokenType(state): string {
            validateSession();
            return state.tokenType;
        },
        getUser(state): AuthUser | null {
            validateSession();
            return state.user;
        },
        getError(state): boolean {
            return state.error;
        },
        getErrorMessage(state): string {
            return state.errorMessage;
        },
        getLoading(state): boolean {
            return state.loading;
        },
        getCenotes(state): Array<CenoteDTO> | null {
            const cenotesStr = localforage.getItem('cenotes');
            const expiryStr = localforage.getItem('cenotesExpiry', (expiry) => {
                return Number(expiry);
            });

            // if the item doesn't exist, return null
            if (!cenotesStr || !expiryStr) {
                return null;
            }

            const expiry = Number(expiryStr);
            const now = new Date();

            // compare the expiry time with the current time
            if (now.getTime() > expiry) {
                state.cenotes = [];
                state.cenotesExpiry = null;
                localforage.removeItem('cenotes');
                localforage.removeItem('cenotesExpiry');
            }

            return state.cenotes;
        },
    },
});

function validateSession() {
    const expiryStr = localStorage.getItem('expiry');

    // if the item doesn't exist, return null
    if (!expiryStr) {
        return null;
    }

    const expiry = JSON.parse(expiryStr);
    const now = new Date();

    // compare the expiry time with the current time
    if (now.getTime() > expiry) {
        // If session is expired, clear session
        clearSession();
        return true;
    }
    return false;
}

function clearSession() {
    state.user = null;
    state.accessToken = '';
    state.tokenType = '';
    state.expiry = null;
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiry');
}

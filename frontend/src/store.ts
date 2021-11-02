import Vue from 'vue';
import Vuex from 'vuex';
import AuthDto from '@/models/user/AuthDto';
import RemoteServices from '@/services/RemoteServices';
import AuthUser from '@/models/user/AuthUser';
import CenoteDTO from './models/CenoteDTO';
import * as localforage from 'localforage';

// TODO: Get session expiry from server
// TODO: Get cenote updates from server (using HATEOAS)

interface State {
    error: boolean;
    errorMessage: string;
    loading: boolean;
    token: string;
    user: AuthUser | null;
    expiry: number | null;
    cenotes: Array<CenoteDTO>;
    cenotesExpiry: number | null;
}

const state: State = {
    error: false,
    errorMessage: '',
    loading: false,
    token: '',
    user: null,
    expiry: null,
    cenotes: [],
    cenotesExpiry: null,
};

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
    state: state,
    mutations: {
        async initializeStore(state) {
            validateSession();

            const token = localStorage.getItem('token');
            if (token) {
                state.token = token;
            }

            const user = localStorage.getItem('user');
            if (user) {
                state.user = JSON.parse(user);
            }

            const expiry = localStorage.getItem('expiry');
            if (expiry) {
                state.expiry = JSON.parse(expiry);
            }

            // const cenotes = localStorage.getItem('cenotes');
            // if (cenotes) {
            //     state.cenotes = JSON.parse(cenotes);
            // }

            try {
                const cenotes = await localforage.getItem(
                    'cenotes',
                    (cenotes) => {
                        state.cenotes = cenotes;
                        return new CenoteDTO(cenotes);
                    },
                );

                console.log(cenotes);
            } catch (err) {
                console.log(err);
            }

            // const cenotesExpiry = localStorage.getItem('cenotesExpiry');
            // if (cenotesExpiry) {
            //     state.cenotes = JSON.parse(cenotesExpiry);
            // }

            try {
                const cenotesExpiry = await localforage.getItem(
                    'cenotesExpiry',
                );
            } catch (err) {
                console.log(err);
            }
        },
        login(state, authResponse: AuthDto) {
            state.token = authResponse.token;
            localStorage.setItem('token', state.token);

            state.user = authResponse.user;
            localStorage.setItem('user', JSON.stringify(state.user));

            // TODO: Get expiry from server
            state.expiry = Date.now() + 60 * 60 * 1000; /* 1 hour */
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
            state.cenotes = cenotes;
            state.cenotesExpiry = Date.now() + 20 * 60 * 1000 /* 20 minutes */;
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
            return !!state.token;
        },
        isAdmin(state): boolean {
            validateSession();
            return (
                !!state.token &&
                state.user !== null &&
                (state.user.admin || state.user.role == 'ADMIN')
            );
        },
        getToken(state): string {
            validateSession();
            return state.token;
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
    state.token = '';
    state.user = null;
    state.expiry = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');
}

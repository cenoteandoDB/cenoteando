import Vue from 'vue';
import Vuex from 'vuex';
import AuthDto from '@/models/user/AuthDto';
import RemoteServices from '@/services/RemoteServices';
import AuthUser from '@/models/user/AuthUser';

interface State {
    error: boolean;
    errorMessage: string;
    loading: boolean;
    token: string;
    user: AuthUser | null;
}

const state: State = {
    error: false,
    errorMessage: '',
    loading: false,
    token: '',
    user: null,
};

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
    state: state,
    mutations: {
        initializeStore(state) {
            const token = localStorage.getItem('token');
            if (token) {
                state.token = token;
            }
            const user = localStorage.getItem('user');
            if (user) {
                state.user = JSON.parse(user);
            }
        },
        login(state, authResponse: AuthDto) {
            localStorage.setItem('token', authResponse.token);
            state.token = authResponse.token;
            localStorage.setItem('user', JSON.stringify(authResponse.user));
            state.user = authResponse.user;
        },
        logout(state) {
            localStorage.setItem('token', '');
            state.token = '';
            localStorage.setItem('user', '');
            state.user = null;
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
            return new Promise<void>((resolve) => {
                commit('logout');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                resolve();
            });
        },
    },
    getters: {
        isLoggedIn(state): boolean {
            return !!state.token;
        },
        isAdmin(state): boolean {
            return (
                !!state.token &&
                state.user !== null &&
                (state.user.admin || state.user.role == 'ADMIN')
            );
        },
        getToken(state): string {
            return state.token;
        },
        getUser(state): AuthUser | null {
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
    },
});

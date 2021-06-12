import Vue from 'vue';
import Vuex from 'vuex';

interface State {
    error: boolean;
    errorMessage: string;
    loading: boolean;
}

const state: State = {
    error: false,
    errorMessage: '',
    loading: false,
};

Vue.use(Vuex);
Vue.config.devtools = true;

export default new Vuex.Store({
    state: state,
    mutations: {
        /*
        initializeStore(state) {
          // TODO: Implement this using localStorage
          // TODO: Token (check RemoteServices.ts in Quizzes Tutor for example usage?)
          // TODO: User
          // TODO: Other saved states?
        },
        login(state, authResponse: AuthModel) {
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
          // TODO: Set other saved states (used in init) to null
        },
        */
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
        /*
    
            // TODO: Create User model
            async login({ commit }, user: User) {
            // TODO: Implement RemoteServices.login(username, password)
              const authResponse = await RemoteServices.login(
                user.username,
                user.password
              );
              commit('login', authResponse);
              // localStorage.setItem("token", authResponse.token);
              // localStorage.setItem("userRole", authResponse.user.role);
            },
            logout({ commit }) {
              return new Promise<void>((resolve) => {
                commit('logout');
                // localStorage.removeItem("token");
                // localStorage.removeItem("userRole");
                resolve();
              });
            },
    
            */
    },
    getters: {
        /*
    
            isLoggedIn(state): boolean {
                return !!state.token;
            },
            getToken(state): string {
                return state.token;
            },
            getUser(state): AuthUser | null {
                return state.user;
            },
    
            */
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

import { createStore } from 'vuex';

export default createStore({
  state: {
    websiteId: null
  },
  mutations: {
    setWebsiteId(state, id) {
      state.websiteId = id;
    }
  },
  actions: {
    fetchWebsiteIdFromServer({ commit }) {
      // Misalnya fetch dari API atau localStorage
      const id = localStorage.getItem('websiteId'); // contoh saja
      if (id) {
        commit('setWebsiteId', parseInt(id));
      }
    }
  }
});

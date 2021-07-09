import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { auth } from "../fb";

Vue.config.productionTip = false;

let app;

// so this should handle 'remembering' that we're logged in
// like, not booting us to the login page whenever we refresh
auth.onAuthStateChanged(function() {
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      router,
      vuetify,
      render: (h) => h(App),
    }).$mount("#app");
  }
});

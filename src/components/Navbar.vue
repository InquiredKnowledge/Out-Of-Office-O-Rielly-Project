<template>
  <v-app-bar app color="white">
    <router-link to="/">
      <v-img :src="require('@/assets/logo-lg.png')" class="d-none d-sm-flex" />
    </router-link>
    <router-link to="/">
      <v-img :src="require('@/assets/logo-sm.png')" class="d-flex d-sm-none" />
    </router-link>

    <v-tabs right color="success">
      <v-tab v-if="isLoggedIn" to="/"> Home </v-tab>
      <v-tab v-else to="/login">Login <v-icon small>mdi-login</v-icon></v-tab>
      <v-tab v-if="isAdmin" to="/admin">Admin</v-tab>
    </v-tabs>

    <!-- user avatar with popup -->
    <v-menu v-if="isLoggedIn" bottom min-width="200px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon x-large v-on="on">
          <v-avatar color="success" size="48">
            <span class="white--text">{{ currentEmail.slice(0, 4) }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list-item-content class="justify-center">
          <div class="mx-auto text-center">
            <h4>{{ currentEmail }}</h4>
            <v-divider class="my-3"></v-divider>
            <v-btn text to="/profile"> PTO History </v-btn>
            <v-divider class="my-3"></v-divider>
            <v-btn text @click="logout"
              >Logout<v-icon small>mdi-logout</v-icon></v-btn
            >
          </div>
        </v-list-item-content>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script>
import { auth } from "../../fb";

export default {
  name: "Navbar",
  data() {
    return {
      isLoggedIn: null,
      currentEmail: null,
      currentUid: null,
      isAdmin: null,

      // snackbar stuff
      snackbar: false,
      snackColor: "error",
      text: "",
    };
  },
  created() {
    this.authCheck();
    // this.adminCheck();
  },

  methods: {
    async authCheck() {
      let temp = await auth.currentUser;
      if (temp) {
        this.isLoggedIn = true;
        this.currentEmail = temp.email;
        // Checks if user is an Admin
        temp.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.admin == true) {
            this.isAdmin = true;
          }
        });
        // console.log("logged in? " + this.isLoggedIn);
      }
    },
    async logout() {
      if (this.isLoggedIn) {
        await auth.signOut().then(
          () => {
            (this.snackColor = "success"), (this.text = `Logged out'`);
            this.snackbar = true;
            // this.$router.go({ path: this.$router.path });
            this.$router.push("/login");
          },
          (err) => {
            (this.snackColor = "error"), (this.text = err.message);
            this.snackbar = true;
          }
        );
      }
    },
  },
};
</script>

<style>
.v-toolbar__content {
  padding-left: 0px !important;
}
</style>
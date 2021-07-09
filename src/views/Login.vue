<template>
  <v-container>
    <!-- snackbar is a popup that will show register success/error messages -->
    <v-snackbar v-model="snackbar" :timeout="4000" top :color="snackColor">
      <span>{{ text }}</span>
      <v-btn right color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-card class="mx-auto grey lighten-3 pa-6" max-width="900px">
      <v-card-title class="pa-0">Login</v-card-title>
      <v-form ref="form" v-model="valid">
        <v-text-field
          color="success"
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          required
        ></v-text-field>

        <v-text-field
          color="success"
          v-model="password"
          :append-icon="passVisibility ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="passVisibility = !passVisibility"
          :type="passVisibility ? 'text' : 'password'"
          :rules="passRules"
          label="Password"
          required
        ></v-text-field>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="validate"
        >
          Log In
        </v-btn>

        <v-btn color="error" class="mr-4" @click="reset">
          Reset Password
        </v-btn>

        <v-btn to="/register" color="primary" font-color="white" class="mr-4">
          Register
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { auth } from "../../fb";

export default {
  data: () => ({
    valid: false,
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      // (v) =>
      //   /^\w+([-+.']\w+)*@?(oreillyauto.com)$/.test(v) ||
      //   "E-mail must be a valid @oreillyauto.com address",
    ],
    password: "",
    passVisibility: false,
    passRules: [(v) => !!v || "Password is required"],

    // snackbar stuff
    snackbar: false,
    snackColor: "error",
    text: "",
  }),

  methods: {
    validate() {
      this.$refs.form.validate();
      if (this.valid) {
        this.login();
      }
    },
    reset() {
      if (!auth.currentUser) {
        this.$router.push("/reset");
      }
    },
    async login() {
      // Sends request to firestore to logout if account is current logged in
      await auth.signInWithEmailAndPassword(this.email, this.password).then(
        () => {
          this.snackColor = "success";
          this.text = `Logged in as '${this.email}'`;
          this.snackbar = true;
          // this.$router.go({ path: this.$router.path });
          // this.$router.push("/");
          this.$router.push({ name: "Home" });
        },
        (err) => {
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        }
      );
    },
  },
};
</script>

<style>
</style>
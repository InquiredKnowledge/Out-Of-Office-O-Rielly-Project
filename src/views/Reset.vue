<template>
  <v-container>
    <!-- snackbar is a popup that will show register success/error messages -->
    <v-snackbar v-model="snackbar" :timeout="4000" top :color="snackColor">
      <span>{{ text }}</span>
      <v-btn right color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-card class="mx-auto grey lighten-3 pa-6" max-width="900px">
      <v-card-title class="pa-0">Reset Password</v-card-title>
      <v-form ref="form" v-model="valid">
        <v-text-field
          color="success"
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          required
        ></v-text-field>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="validate"
        >
          Reset
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
      (v) =>
        /^\w+([-+.']\w+)*@?(oreillyauto.com|oreillyautoparts.com)$/.test(v) ||
        "E-mail must be a valid @oreillyauto.com address",
    ],

    // snackbar stuff
    snackbar: false,
    snackColor: "error",
    text: "",
  }),

  methods: {
    validate() {
      this.$refs.form.validate();
      if (this.valid) {
        auth
          .sendPasswordResetEmail(this.email)
          .then(() => {
            (this.snackColor = "success"),
              (this.text = `Reset instructions sent to '${this.email}'`);
            this.snackbar = true;
            this.$router.push("/login");
          })
          .catch((err) => {
            (this.snackColor = "error"), (this.text = err.message);
            this.snackbar = true;
          });
      }
    },
  },
};
</script>

<style>
</style>
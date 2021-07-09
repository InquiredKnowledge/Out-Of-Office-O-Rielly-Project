<template>
  <v-container>
    <!-- snackbar is a popup that will show register success/error messages -->
    <v-snackbar v-model="snackbar" :timeout="4000" top :color="snackColor">
      <span>{{ text }}</span>
      <v-btn right color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-card class="mx-auto grey lighten-3 pa-6" max-width="900px">
      <v-card-title class="pa-0">Register</v-card-title>
      <!-- boiler plate code from vuetify site, replace later -->
      <v-form ref="form" v-model="valid">
        <!-- email -->
        <v-text-field
          color="success"
          v-model="email"
          :rules="emailRules"
          label="O'Reilly Email"
          required
        ></v-text-field>

        <!--password-->
        <!-- note the awesome visibility switcheroo -->
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

        <!-- first name -->
        <v-text-field
          color="success"
          v-model="fName"
          :counter="20"
          :rules="nameRules"
          label="Full Name"
          required
        ></v-text-field>

        <!-- tm number -->
        <v-text-field
          color="success"
          v-model="membernumber"
          :rules="[(v) => !!v || 'Team Member Number is required']"
          label="Team Member Number"
          required
        ></v-text-field>

        <!-- supervisor -->
        <v-select
          color="success"
          v-model="supervisor"
          :items="supervisors"
          :rules="[(v) => !!v || 'Item is required']"
          label="Supervisor"
          item-text="name"
          return-object
          required
        ></v-select>

        <!-- title -->
        <v-text-field
          color="success"
          v-model="title"
          :rules="[(v) => !!v || 'Title is required']"
          label="Job Title"
          required
        ></v-text-field>

        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              color="success"
              v-model="date"
              label="Anniversary Date"
              append-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              :rules="[(v) => !!v || 'Date is required']"
              v-on="on"
              required
            ></v-text-field>
          </template>
          <v-date-picker
            color="success"
            v-model="date"
            @input="menu = false"
          ></v-date-picker>
        </v-menu>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="validate"
        >
          Register
        </v-btn>
        <v-btn color="error" class="mr-4" @click="reset"> Reset Form </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { auth, functions, usersCollection } from "../../fb";

export default {
  data: () => ({
    valid: false,
    fName: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 30) || "Name must be less than 30 characters",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      // (v) =>
      //   /^\w+([-+.']\w+)*@?(oreillyauto.com)$/.test(v) ||
      //   "E-mail must be a valid @oreillyauto.com address",
    ],
    membernumber: "",
    select: null,
    supervisor: null,
    supervisors: [], // this will get the supervisor array from a list of admin users
    password: "",
    passVisibility: false,
    passRules: [(v) => !!v || "Password is required"],
    title: "",
    date: new Date().toISOString().substr(0, 10),
    menu: false,

    // snackbar stuff
    snackbar: false,
    snackColor: "error",
    text: "",
  }),

  created() {
    this.getSupes();
  },

  methods: {
    async getSupes() {
      const grabSupervisors = functions.httpsCallable("grabSupervisors");
      await grabSupervisors()
        .then((result) => {
          console.log(result);
          this.supervisors = result.data.supervisors;
        })
        .then(() => {
          console.log("User table successfully modified");
        });

      //await db
      //.collectionGroup("Users")
      //.where("IsAdmin", "==", true)
      //.get()
      //.then((collection) => {
      //collection.docs.forEach((doc) => {
      //let temp = doc.data();
      //let name = temp.Full_Name;
      //let email = temp.TM_Email;
      //this.supervisors.push({
      // [name]: email,
      //name: name,
      //email: email,
      //});
      //});
      //});
    },

    validate() {
      this.$refs.form.validate();
      if (this.valid) {
        this.register();
      }
    },
    reset() {
      this.$refs.form.reset();
    },
    async register() {
      // Sends request to firestore to create an account, throws error when it cant
      await auth
        .createUserWithEmailAndPassword(this.email, this.password)
        .then((cred) => {
          this.snackColor = "success";
          this.text = `Account created for '${cred.user.email}'`;
          this.snackbar = true;
          this.addToDB(cred);
          // this.$router.go({ path: this.$router.path });
        })
        .catch((err) => {
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        });
    },
    async addToDB(cred) {
      // this is where the user is added to the db
      await usersCollection
        .doc(cred.user.uid)
        .set({
          Full_Name: this.fName,
          Supervisor_Name: this.supervisor.name, // check here when starting over
          Supervisor_Email: this.supervisor.email, // check here when starting over
          TM_Email: this.email,
          TM_Num: this.membernumber,
          Title: this.title,
          Anniversary_Date: this.date,
          User_ID: cred.user.uid,
          IsAdmin: false,
        })
        .then(() => {
          // this.$router.go({ path: this.$router.path }); // then finally go to next route
          this.$router.push("/");
        })
        .catch((err) => {
          console.log(err);
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        });
    },
  },
};
</script>
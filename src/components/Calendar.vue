<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <!-- sidebar with checkboxes lives here -->
      <h3 class="ml-6 my-4">
        Filters

        <v-btn text color="grey darken-2" @click="resetFilters" absolute right>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </h3>
      <!-- Expandable Filter pane -->
      <v-expansion-panels>
        <!-- PTO Type Filters -->
        <v-expansion-panel>
          <v-expansion-panel-header>PTO Type</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(item, i) in ptoItems2">
              <v-list-item :key="i">
                <v-list-item-content>
                  <v-chip :class="item.color" text-color="white" label>
                    {{ item.type }}
                  </v-chip>
                  <!-- <v-list-item-title class="white--text" ></v-list-item-title> -->
                </v-list-item-content>
                <v-list-item-action>
                  <v-checkbox
                    :value="item.type"
                    v-model="ptoFilters"
                    :color="item.color"
                  ></v-checkbox>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <!-- Supervisor Filters -->
        <v-expansion-panel>
          <v-expansion-panel-header>Supervisor</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(supe, i) in supervisors">
              <v-list-item :key="i">
                <v-list-item-content>
                  <v-list-item-title>{{ supe.fname }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-checkbox
                    :value="supe.fname"
                    v-model="supeFilters"
                  ></v-checkbox>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <!-- Team Member Filters -->
        <v-expansion-panel>
          <v-expansion-panel-header>Team Member</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(teamie, i) in teamies">
              <v-list-item-title :key="i">
                <v-list-item-content>
                  <v-list-item-title>{{ teamie.fname }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-checkbox
                    :value="teamie.fname"
                    v-model="teamieFilters"
                  ></v-checkbox>
                </v-list-item-action>
              </v-list-item-title>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>

    <!-- snackbar for popup messages -->
    <v-snackbar v-model="snackbar" :timeout="4000" top :color="snackColor">
      <span>{{ text }}</span>
      <v-btn right color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-row class="fill-height">
      <!-- calendar buttons -->
      <v-col>
        <v-sheet height="64">
          <v-toolbar flat>
            <!-- progress bar while the calendar loads -->
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              absolute
              bottom
              color="success"
            ></v-progress-linear>
            <v-btn fab color="grey darken-2" text @click="drawer = !drawer">
              <v-icon>mdi-filter</v-icon>
            </v-btn>
            <v-btn color="grey darken-2" text @click="type = 'month'">
              <v-toolbar-title v-if="$refs.calendar">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
              <!-- for when it doesn't feel like showing the title, we compute it ourselves 😒 -->
              <v-toolbar-title v-else>
                {{ titleDate }}
              </v-toolbar-title>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>
            <v-btn
              fab
              text
              small
              color="grey darken-2"
              class="mr-4"
              @click="next"
            >
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>

            <v-menu bottom right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                  <span>{{ typeToLabel[type] }}</span>
                  <v-icon right> mdi-menu-down </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'day'">
                  <v-list-item-title>Day</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                  <v-list-item-title>Week</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                  <v-list-item-title>Month</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = '4day'">
                  <v-list-item-title>4 days</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-spacer></v-spacer>

            <v-btn
              class="mr-4"
              color="success"
              @click.stop="dialog = true"
              @click="reset"
            >
              New Request
            </v-btn>
          </v-toolbar>
        </v-sheet>

        <!--New Request Dialog -->
        <v-dialog v-model="dialog" max-width="500">
          <v-card>
            <v-card-title class="pl-3">PTO Request </v-card-title>
            <v-container>
              <v-form ref="form" v-model="valid">
                <!-- request type, start date, end date, total hours, description -->
                <!-- Request Type -->
                <v-select
                  color="success"
                  v-model="ptoType"
                  :items="ptoItems2"
                  item-text="type"
                  return-object
                  :rules="[(v) => !!v || 'Please select a PTO type']"
                  label="PTO Type"
                  required
                ></v-select>

                <!-- Start Date -->
                <v-menu
                  v-model="menuForStartDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      color="success"
                      v-model="startDate"
                      label="PTO Start"
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
                    v-model="startDate"
                    @input="menuForStartDate = false"
                  ></v-date-picker>
                </v-menu>

                <!-- End Date -->
                <v-menu
                  v-model="menuForEndDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      color="success"
                      v-model="endDate"
                      label="PTO End"
                      append-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    color="success"
                    v-model="endDate"
                    @input="menuForEndDate = false"
                  ></v-date-picker>
                </v-menu>

                <!-- Hours -->
                <v-text-field
                  color="success"
                  v-model="totalHours"
                  :rules="hourRules"
                  label="Total Hours"
                  required
                ></v-text-field>

                <!-- Description -->
                <v-text-field
                  color="success"
                  v-model="description"
                  :counter="50"
                  label="Description"
                ></v-text-field>

                <v-btn
                  color="success"
                  class="mr-4"
                  @click="validate"
                  :disabled="!valid"
                  >Submit Request
                </v-btn>

                <v-btn color="error" class="mr-4" @click.stop="dialog = false">
                  Cancel
                </v-btn>
              </v-form>
            </v-container>
          </v-card>
        </v-dialog>

        <!-- actual calendar lives here 📆 -->
        <v-sheet height="800">
          <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="this.filterRequests"
            :event-color="getEventColor"
            :type="type"
            interval-count="0"
            interval-width="0"
            interval-height="0"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
          ></v-calendar>
          <!-- @change="this.$refs.calendar.checkChange()" -->
          <!-- @change="updateRange" -->

          <!-- 🃏 card when you click a person's PTO -->
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            min-width="350px"
            max-width="500px"
            offset-x
          >
            <v-card
              color="grey lighten-4"
              min-width="350px"
              max-width="500px"
              flat
            >
              <v-toolbar :color="selectedEvent.color" dark>
                <v-toolbar-title
                  class="ml-4"
                  v-html="selectedEvent.name"
                ></v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <h3>{{ selectedEvent.ptoType }}</h3>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { auth, db, functions, usersCollection, mailCollection } from "../../fb";

export default {
  data: () => ({
    hourRules: [
      (v) => !!v || "Enter the number of hours for this PTO request",
      (v) => /^[1-9]\d*$/.test(v) || "Valid number required",
    ],
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    loading: false,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    dialog: false,
    startDate: null,
    endDate: null,
    description: "",
    ptoType: null, // an object like {type: "Sick", color: "orange"}
    // isAdmin: null,
    filterPtoType: null,
    totalHours: null,
    user: null,
    valid: false,
    menuForStartDate: false,
    menuForEndDate: false,
    userTemp: null,
    drawer: null,
    checkbox: true,
    selected: null,

    ptoItems: [
      "Vacation",
      "Personal",
      "Sick",
      "Floating Holiday",
      "Bereavement",
      "Other",
    ],
    ptoItems2: [
      { type: "Vacation", color: "green" },
      { type: "Personal", color: "blue" },
      { type: "Sick", color: "orange" },
      { type: "Floating Holiday", color: "cyan" },
      { type: "Bereavement", color: "deep-purple" },
      { type: "Other", color: "indigo" },
    ],
    colors: ["blue", "indigo", "deep-purple", "cyan", "green", "orange"],
    requests: [], // grabbed from the requests db
    supervisors: [], // this will get the supervisor array from a list of admin users
    teamies: [], // this will get the team members
    // filter stuff
    ptoFilters: [],
    supeFilters: [],
    teamieFilters: [],
    tempArray: [],

    // snackbar stuff
    snackbar: false,
    snackColor: "error",
    text: "",
  }),

  mounted() {
    this.loading = true;
    this.$refs.calendar.checkChange();
    this.queryRequests();
    this.getUserData();

    // this.adminCheck();
  },

  // this is used when the title doesn't show the month and year for some reason
  computed: {
    titleDate: function () {
      let date = new Date();
      let month = date.toLocaleString("default", { month: "long" });
      return `${month} ${date.getFullYear()}`;
    },

    // handles the checkbox filtering
    filterRequests: function () {
      let tempArray = this.requests;
      // if the filterarrays are empty (no checkboxes checked) return the og array
      if (
        !this.ptoFilters.length &&
        !this.supeFilters.length &&
        !this.teamieFilters.length
      )
        return tempArray;
      if (this.ptoFilters.length > 0) {
        // filter based on the ptoType
        tempArray = tempArray.filter((x) => {
          return this.ptoFilters.includes(x.ptoType);
        });
      }
      // filter based on the supe
      // their name, so hopefully no one has exact first and last names
      if (this.supeFilters.length > 0) {
        tempArray = tempArray.filter((x) => {
          return this.supeFilters.includes(x.supervisor);
        });
      }
      // filter based on the teamie
      if (this.teamieFilters.length > 0) {
        tempArray = tempArray.filter((x) => {
          return this.teamieFilters.includes(x.name);
        });
      }
      return tempArray;
    },
  },

  methods: {
    // async adminCheck() {
    //   let temp = await auth.currentUser;
    //   // Checks if user is an Admin
    //   temp.getIdTokenResult().then((idTokenResult) => {
    //     if (idTokenResult.claims.admin == true) {
    //       this.isAdmin = true;
    //     }
    //   });
    // },

    reset() {
      if (this.$refs.form) this.$refs.form.reset();
    },

    resetFilters() {
      this.teamieFilters = [];
      this.supeFilters = [];
      this.ptoFilters = [];
    },

    async emailRequest() {
      let html = `
    <div style="font-family: Arial, Helvetica, sans-serif;">
    <h4>Hi there ${this.userTemp.Supervisor_Name}, your employee 
    <em>${this.userTemp.Full_Name}</em> is requesting time off.
    </h4>
    <h5>Type: ${this.ptoType.type}</h5>
    <h5>Reason: ${this.description}</h5>
    <h5>Date: ${this.startDate} - ${this.endDate ? this.endDate : ""}</h5>
    <h5><a target="_blank" style="color: cornflowerblue;text-decoration: none;" href="https://oreilly-pto-calendar.web.app/admin">Approve or Deny here</a></h5>
    </div>`;

      await mailCollection.add({
        to: this.userTemp.Supervisor_Email,
        message: {
          subject: `${this.userTemp.Full_Name} is requesting PTO 👈`,
          html: html,
        },
      });
    },

    // boiler plate calendar stuff
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => {
          this.selectedOpen = true;
        }, 10);
      };
      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }
      nativeEvent.stopPropagation();
    },

    // validate will send the request to db and close the form
    async validate() {
      this.$refs.form.validate();
      if (this.valid) {
        await this.addToRequestsDB().catch((err) => {
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        });
        this.dialog = false;
      }
    },

    // grabs user info at the start
    async getUserData() {
      let temp = await usersCollection
        .doc(auth.currentUser.uid)
        .get()
        .catch((err) => {
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        });
      this.userTemp = temp.data();
    },

    async addToRequestsDB() {
      await usersCollection
        .doc(auth.currentUser.uid)
        .collection("Requests")
        .add({
          User_ID: auth.currentUser.uid,
          Full_Name: this.userTemp.Full_Name,
          Start_Date: this.startDate,
          End_Date: this.endDate,
          Request_Date: new Date().toISOString().substr(0, 10),
          Supervisor_Name: this.userTemp.Supervisor_Name,
          TM_Number: this.userTemp.TM_Num,
          TM_Email: auth.currentUser.email,
          Total_Hours: this.totalHours,
          Request_Type: this.ptoType.type,
          Description: this.description,
          Reason: "",
          Status: "pending",
          Color: this.ptoType.color,
        });
      this.snackColor = "success";
      this.text = "Request sent to " + this.userTemp.Supervisor_Name;
      this.snackbar = true;
      this.emailRequest(); // and send an email at the end
    },

    async queryRequests() {
      // fills calendar
      const grabRequests = functions.httpsCallable("grabRequests");
      // Grabs queried requests that are approved
      await grabRequests()
        .then((results) => {
          this.requests = results.data.requests;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err + " Grabbing requests error");
        });

      //Array for Supervisors filter list
      // this could be a foreach loop on the this.requests array
      await db
        .collection("Users")
        .where("IsAdmin", "==", true)
        .get()
        .then((collection) => {
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            this.supervisors.push({
              fname: temp.Full_Name,
            });
          });
        });

      // Array for Team Members filter list
      await db
        .collection("Users")
        .get()
        .then((collection) => {
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            this.teamies.push({
              fname: temp.Full_Name,
            });
          });
        });
    },
  },
};
</script>

<style>
.theme--light.v-calendar-events .v-event-more {
  background-color: transparent !important;
}

.v-calendar-daily__scroll-area {
  overflow-y: auto !important;
}
</style>
<template>
  <v-container fluid>
    <h3 color="grey darken-2">Info</h3>
    <v-data-table
      :headers="tminformationHeaders"
      :items="tminformation"
      hide-default-footer
      class="elevation-1 my-4"
    >
      <template v-slot:[`item.hours`]>
        <v-chip color="success" dark>
          {{ computedTotalHours }}
        </v-chip>
      </template>

      <template v-slot:no-data>
        <span>No info here 😓</span>
      </template>
    </v-data-table>
    <h3 color="grey darken-2">Request Archive</h3>
    <v-data-table
      :headers="historyHeaders"
      :items="history"
      class="elevation-1 my-4"
    >
      <template v-slot:no-data>
        <span>No requests here 😓</span>
      </template></v-data-table
    >
  </v-container>
</template>

<script>
import { auth, usersCollection } from "../../fb";
export default {
  data() {
    return {
      historyHeaders: [
        {
          text: "Request Date",
          align: "start",
          value: "requestdate",
        },
        {
          text: "Team Member",
          value: "name",
        },
        { text: "PTO Type", value: "ptotype" },
        { text: "Start Date", value: "startdate" },
        { text: "End Date", value: "enddate" },
        { text: "Hours", value: "totalhours" },
        { text: "Description", value: "description" },
        { text: "Status", value: "status" },
        { text: "Reason", value: "reason" },
        { text: "Supervisor", value: "supervisor" },
      ],

      tminformationHeaders: [
        {
          text: "TM Number",
          align: "start",
          value: "tmnumber",
        },
        { text: "Team Member", value: "name" },
        { text: "Title", value: "title" },
        { text: "Supervisor", value: "supervisor" },
        { text: "Email", value: "email" },
        { text: "Anniversary Date", value: "anniversary" },
        { text: "PTO Hours Used", value: "hours" },
      ],

      // and history goes here
      history: [],
      // annnd tm information here
      tminformation: [],
    };
  },
  created() {
    this.queryRequests();
    this.getUserData();
  },

  computed: {
    // goes through User array and adds up their PTO hours used
    computedTotalHours: function () {
      return this.history
        .filter((x) => x.status == "approved")
        .reduce((total, hours) => total + +hours.totalhours, 0);
    },
  },

  methods: {
    // fill the user info table
    async getUserData() {
      let temp = await usersCollection
        .doc(auth.currentUser.uid)
        .get()
        .catch((err) => {
          this.snackColor = "error";
          this.text = err.message;
          this.snackbar = true;
        });
      let userTemp = temp.data();
      this.tminformation.push({
        tmnumber: userTemp.TM_Num,
        name: userTemp.Full_Name,
        title: userTemp.Title,
        supervisor: userTemp.Supervisor_Name,
        email: userTemp.TM_Email,
        anniversary: userTemp.Anniversary_Date,
      });
    },
    // Grabs request documents
    async queryRequests() {
      // fills request history table
      await usersCollection
        .doc(auth.currentUser.uid)
        .collection("Requests")
        .get()
        .then((collection) => {
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            this.history.push({
              userID: temp.User_ID,
              requestID: doc.id,
              name: temp.Full_Name,
              requestdate: temp.Request_Date,
              ptotype: temp.Request_Type,
              startdate: temp.Start_Date,
              enddate: temp.End_Date,
              totalhours: temp.Total_Hours,
              description: temp.Description,
              supervisorid: temp.Supervisor_ID,
              supervisor: temp.Supervisor_Name,
              status: temp.Status,
              reason: temp.Reason,
            });
          });
        });
    },
  },
};
</script>

<style>
</style>
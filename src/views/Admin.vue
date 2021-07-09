<template>
  <v-container fluid>
    <!-- snackbar is a popup that will show success/error messages -->
    <v-snackbar v-model="snackbar" :timeout="4000" top :color="snackColor">
      <span>{{ text }}</span>
      <v-btn right color="white" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <!-- add request for user button -->
    <v-btn
      v-if="this.tab == 0"
      fab
      color="success"
      right
      bottom
      fixed
      @click="dialogTMRequest = true"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-tabs color="success" v-model="tab">
      <v-tab> Pending Requests </v-tab>
      <v-tab> Request History </v-tab>
      <v-tab> TM Information </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <!-- PENDING REQUESTS TABLE HERE -->
      <v-tab-item>
        <v-data-table
          :headers="requestHeaders"
          :items="requests"
          class="elevation-1"
        >
          <template v-slot:top>
            <!-- approve confirm popup-->
            <v-dialog v-model="dialogApprove" max-width="500px">
              <v-card>
                <v-card-title class="headline"
                  >Approve this request?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" class="mr-4" @click="closeApprove"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="success"
                    class="mr-4"
                    @click="approveRequestConfirm"
                    >OK</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- deny confirm popup-->
            <v-dialog v-model="dialogDeny" max-width="500px">
              <v-card>
                <v-card-title class="headline">Deny this request?</v-card-title>
                <v-card-actions>
                  <v-container>
                    <!-- decline_reason -->

                    <v-text-field
                      color="success"
                      v-model="decline_reason"
                      :counter="50"
                      label="Reason"
                    ></v-text-field>

                    <v-btn color="error" class="mr-4" @click="closeDeny"
                      >Cancel</v-btn
                    >
                    <v-btn
                      color="success"
                      class="mr-4"
                      @click="denyRequestConfirm"
                      >OK</v-btn
                    >
                  </v-container>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- add request for tm form-->
            <v-dialog v-model="dialogTMRequest" max-width="500px">
              <v-card>
                <v-card-title class="headline">Add Request for TM</v-card-title>
                <v-container>
                  <v-form ref="addRequestForm" v-model="valid">
                    <!-- users dropdown -->
                    <v-select
                      color="success"
                      v-model="addRequestUser"
                      label="Employee"
                      :items="tminformation"
                      item-text="name"
                      return-object
                      required
                    >
                    </v-select>

                    <!-- their boss -->
                    <v-select
                      color="success"
                      v-model="addRequestSupervisor"
                      :items="supervisors"
                      label="Supervisor"
                      item-text="name"
                      return-object
                      required
                    ></v-select>

                    <v-select
                      color="success"
                      v-model="addRequestPtoType"
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
                          v-model="addRequestStartDate"
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
                        v-model="addRequestStartDate"
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
                          v-model="addRequestEndDate"
                          label="PTO End"
                          append-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        color="success"
                        v-model="addRequestEndDate"
                        @input="menuForEndDate = false"
                      ></v-date-picker>
                    </v-menu>

                    <!-- Hours -->
                    <v-text-field
                      color="success"
                      v-model="addRequestTotalHours"
                      :rules="addRequestHourRules"
                      label="Total Hours"
                      required
                    ></v-text-field>

                    <!-- Description -->
                    <v-text-field
                      color="success"
                      v-model="addRequestDescription"
                      :counter="50"
                      label="Description"
                    ></v-text-field>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" class="mr-4" @click="closeTMRequest"
                        >Cancel</v-btn
                      >
                      <v-btn
                        color="success"
                        class="mr-4"
                        @click="validate"
                        :disabled="!valid"
                        >OK</v-btn
                      >
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-form>
                </v-container>
              </v-card>
            </v-dialog>
          </template>

          <!-- the approve/deny buttons -->
          <template v-slot:[`item.approvedeny`]="{ item }">
            <v-btn
              @click="approveItem(item)"
              class="mr-2"
              text
              icon
              color="blue lighten-2"
            >
              <v-icon>mdi-thumb-up</v-icon>
            </v-btn>

            <v-btn
              @click="denyItem(item)"
              class="mr-2"
              text
              icon
              color="red lighten-2"
            >
              <v-icon>mdi-thumb-down</v-icon>
            </v-btn>
          </template>
          <!-- when there are no requests this shows -->
          <template v-slot:no-data>
            <span>No requests here 😓</span>
          </template>
        </v-data-table>
      </v-tab-item>

      <!-- REQUEST HISTORY HERE -->
      <v-tab-item>
        <v-data-table
          :headers="historyHeaders"
          :items="history"
          :sort-by="['requestdate']"
          :sort-desc="[true]"
          class="elevation-1"
        >
          <!-- the delete request button -->
          <template v-slot:[`item.historydelete`]="{ item }">
            <v-btn
              @click="deleteRequest(item)"
              class="mr-2"
              text
              icon
              color="grey darken-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <span>No history here 😓</span>
          </template>

          <template v-slot:top>
            <v-dialog v-model="dialogDeleteRequest" max-width="500px">
              <v-card>
                <v-card-title class="headline">Delete Request?</v-card-title>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" class="mr-4" @click="closeDeleteRequest"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="success"
                    class="mr-4"
                    @click="deleteRequestConfirm"
                    >OK</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-data-table>
      </v-tab-item>

      <!-- TM INFORMATION HERE -->
      <v-tab-item>
        <v-data-table
          :headers="tminformationHeaders"
          :items="tminformation"
          class="elevation-1"
        >
          <template v-slot:[`item.hours`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip color="success" dark v-bind="attrs" v-on="on">
                  {{ getTotalHours(item.userID) }}
                </v-chip>
              </template>
              <span
                >Vacation:
                {{ getTotalHoursByType(item.userID, "Vacation") }}</span
              >
              <br />
              <span
                >Personal:
                {{ getTotalHoursByType(item.userID, "Personal") }}</span
              >
              <br />
              <span>Sick: {{ getTotalHoursByType(item.userID, "Sick") }}</span>
              <br />
              <span
                >Floating Holiday:
                {{ getTotalHoursByType(item.userID, "Floating Holiday") }}</span
              >
              <br />
              <span
                >Bereavement:
                {{ getTotalHoursByType(item.userID, "Bereavement") }}</span
              >
              <br />
              <span
                >Other: {{ getTotalHoursByType(item.userID, "Other") }}</span
              >
            </v-tooltip>
          </template>

          <template v-slot:top>
            <!-- edit confirm popup-->
            <v-dialog v-model="dialogEdit" max-width="500px">
              <v-card>
                <v-card-title class="headline">Edit Team Member</v-card-title>

                <!--  -->
                <v-container>
                  <v-form ref="editTMForm">
                    <!-- TM Number -->
                    <v-text-field
                      color="success"
                      v-model="editTMNumber"
                      label="TM Number"
                    ></v-text-field>

                    <!-- TM Name -->
                    <v-text-field
                      color="success"
                      v-model="editTMName"
                      label="Name"
                    ></v-text-field>

                    <!-- TM Title -->
                    <v-text-field
                      color="success"
                      v-model="editTMTitle"
                      label="Title"
                    ></v-text-field>

                    <!-- TM Supervisor -->
                    <v-select
                      color="success"
                      v-model="editTMSupervisor"
                      :items="supervisors"
                      label="Supervisor"
                      item-text="name"
                      return-object
                    ></v-select>

                    <!-- TM Anniversary Date -->
                    <v-text-field
                      color="success"
                      v-model="editTMAnniversaryDate"
                      label="Anniversary Date"
                    ></v-text-field>

                    <!-- TM Is Admin? -->
                    <v-switch
                      color="success"
                      v-model="editTMIsAdmin"
                      inset
                      :label="`Admin`"
                      @click="makeAdmin(editTMIsAdmin)"
                    ></v-switch>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" class="mr-4" @click="closeEdit"
                        >Cancel</v-btn
                      >
                      <v-btn color="success" class="mr-4" @click="editTMConfirm"
                        >OK</v-btn
                      >
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-form>
                </v-container>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="headline"
                  >Delete Team Member?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" class="mr-4" @click="closeDelete"
                    >Cancel</v-btn
                  >
                  <v-btn color="success" class="mr-4" @click="deleteTMConfirm"
                    >OK</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <!-- the approve/deny buttons -->
          <template v-slot:[`item.editdelete`]="{ item }">
            <v-btn
              @click="editItem(item)"
              class="mr-2"
              text
              icon
              color="grey darken-2"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              @click="deleteItem(item)"
              class="mr-2"
              text
              icon
              color="grey darken-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <span>No employees here 😓</span>
          </template>
        </v-data-table>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import { db, functions, usersCollection, mailCollection } from "../../fb";

export default {
  data: () => ({
    tab: null,
    dialogDeny: false,
    dialogApprove: false,
    dialogEdit: false,
    dialogDelete: false,
    dialogDeleteRequest: false,
    dialogTMRequest: false,
    decline_reason: "",

    // these are for the edit employee popup
    editTMNumber: null,
    editTMName: null,
    editTMTitle: null,
    editTMSupervisor: null,
    editTMAnniversaryDate: null,
    editTMIsAdmin: null,

    // these are for the add request for employee popup
    addRequestUser: null,
    addRequestSupervisor: null,
    addRequestStartDate: null,
    addRequestEndDate: null,
    addRequestDescription: null,
    addRequestPtoType: null,
    addRequestTotalHours: null,
    addRequestHourRules: [
      (v) => !!v || "Enter the number of hours for this PTO request",
      (v) => /^[1-9]\d*$/.test(v) || "Valid number required",
    ],
    addRequestPtoItems: [
      "Vacation",
      "Personal",
      "Sick",
      "Floating Holiday",
      "Bereavement",
      "Other",
    ],
    addRequestColors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
    ],

    ptoItems2: [
      { type: "Vacation", color: "green" },
      { type: "Personal", color: "blue" },
      { type: "Sick", color: "orange" },
      { type: "Floating Holiday", color: "cyan" },
      { type: "Bereavement", color: "deep-purple" },
      { type: "Other", color: "indigo" },
    ],

    menuForStartDate: false,
    menuForEndDate: false,
    valid: false,
    //end request for tm stuff

    requestHeaders: [
      {
        text: "Team Member",
        align: "start",
        value: "name",
      },
      { text: "PTO Type", value: "ptotype" },
      { text: "Start Date", value: "startdate" },
      { text: "End Date", value: "enddate" },
      { text: "Total Hours", value: "totalhours" },
      { text: "Description", value: "description" },
      { text: "Supervisor", value: "supervisor" },
      { text: "Approve/Deny", value: "approvedeny", sortable: false },
    ],
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
      { text: "Total Hours", value: "totalhours" },
      { text: "Description", value: "description" },
      { text: "Status", value: "status" },
      { text: "Denied Reason", value: "reason" },
      { text: "Supervisor", value: "supervisor" },
      { text: "Delete", value: "historydelete", sortable: false },
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
      { text: "Edit/Delete", value: "editdelete", sortable: false },
    ],

    // actual requests will be firebased into here
    requests: [],
    // and history goes here
    history: [],
    // annnd tm information here
    tminformation: [],
    supervisors: [], // this will get the supervisor array from a list of admin users
    requestIndex: -1,
    editIndex: -1,
    historyIndex: -1,
    // userTemp: null,

    // snackbar stuff
    snackbar: false,
    snackColor: "error",
    text: "",
  }),

  watch: {
    dialogDeny(val) {
      val || this.closeApprove();
    },
    dialogApprove(val) {
      val || this.closeApprove();
    },
    dialogEdit(val) {
      val || this.closeEdit();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    dialogDeleteRequest(val) {
      val || this.closeDeleteRequest();
    },
    dialogTMRequest(val) {
      val || this.closeTMRequest();
    },
  },

  // this will be what initially gets all the firebase db information
  created() {
    this.queryRequests();
    // this.getUserData();
    this.getSupes();
  },

  methods: {
    // calculates a user's total PTO hours
    getTotalHours(theirID) {
      return this.history
        .filter((x) => x.userID == theirID)
        .filter((x) => x.status == "approved" || "Approved")
        .reduce((total, request) => total + +request.totalhours, 0);
    },

    // someone's individual pto hour totals by type
    getTotalHoursByType(theirID, ptoType) {
      return this.history
        .filter((x) => x.userID == theirID)
        .filter((x) => x.status == "approved" || "Approved")
        .filter((x) => x.ptotype == ptoType)
        .reduce((total, request) => total + +request.totalhours, 0);
    },

    validate() {
      this.$refs.addRequestForm.validate();
      if (this.valid) {
        this.addRequestConfirm();
      }
    },

    // lets admin add a request on behalf of a user
    async addRequestForTM() {
      await usersCollection
        .doc(this.addRequestUser.userID)
        .collection("Requests")
        .add({
          User_ID: this.addRequestUser.userID,
          Full_Name: this.addRequestUser.name,
          Start_Date: this.addRequestStartDate,
          End_Date: this.addRequestEndDate,
          Request_Date: new Date().toISOString().substr(0, 10),
          Supervisor_Name: this.addRequestSupervisor.name,
          TM_Number: this.addRequestUser.tmnumber,
          TM_Email: this.addRequestUser.email,
          Total_Hours: this.addRequestTotalHours,
          Request_Type: this.addRequestPtoType.type,
          Description: this.addRequestDescription || "",
          Reason: "",
          Status: "pending",
          Color: this.addRequestPtoType.color,
        });
      this.snackColor = "success";
      this.text = "Request sent to " + this.addRequestSupervisor.name;
      this.snackbar = true;
      this.emailRequest(); // and send an email at the end
      this.updateRequestsTable(); // and refresh the requests to add it
    },

    async emailRequest() {
      let html = `
    <div style="font-family: Arial, Helvetica, sans-serif;">
    <h4>Hi there ${this.addRequestSupervisor.name}, your employee 
    <em>${this.addRequestUser.name}</em> is requesting time off.
    </h4>
    <h5>Type: ${this.addRequestPtoType}</h5>
    <h5>Reason: ${this.addRequestDescription}</h5>
    <h5>Date: ${this.addRequestStartDate} - ${
        this.addRequestEndDate ? this.addRequestEndDate : ""
      }</h5>
    <h5><a target="_blank" style="color: cornflowerblue;text-decoration: none;" href="https://oreilly-pto-calendar.web.app/admin">Approve or Deny here</a></h5>
    </div>`;

      await mailCollection.add({
        to: this.addRequestSupervisor.email,
        message: {
          subject: `${this.addRequestUser.name} is requesting PTO 👈`,
          html: html,
        },
      });
    },

    // fires off when the user clicks OK on APPROVE dialog
    async emailApprove(request) {
      let html = `
    <div style="font-family: Arial, Helvetica, sans-serif;">
    <h4>${request.name}, your PTO has been approved!</h4>
    <h5>Description: ${request.description}</h5>
    <h5>PTO Type: ${request.ptotype}</h5>
    <h5>Date: ${request.startdate} - ${
        request.enddate ? request.enddate : ""
      }</h5>
    <h5>Total Hours: ${request.totalhours}</h5>
    </div>`;

      await mailCollection.add({
        to: request.useremail,
        message: {
          subject: "PTO Approved 👍",
          html: html,
        },
      });
      this.snackColor = "success";
      this.text = "Message sent to " + request.useremail;
      this.snackbar = true;
    },

    // fires off when the user hits OK on DENY dialog
    async emailDeny(request) {
      let html = `
    <div style="font-family: Arial, Helvetica, sans-serif;">
    <h4>${request.name}, your PTO has been denied for the following reason: 
    <i> ${request.reason}</i></h4>
    <h5>Description: ${request.description}</h5>
    <h5>PTO Type: ${request.ptotype}</h5>
    <h5>Date: ${request.startdate} - ${
        request.enddate ? request.enddate : ""
      }</h5>
    <h5>Total Hours: ${request.totalhours}</h5>
    <h5>Please reach out to your supervisor for additional details</h5>
    </div>`;

      await mailCollection.add({
        to: request.useremail,
        message: {
          subject: "PTO Denied 👎",
          html: html,
        },
      });
      this.snackColor = "success";
      this.text = "Message sent to " + request.useremail;
      this.snackbar = true;
    },

    approveItem(item) {
      this.requestIndex = this.requests.indexOf(item);
      this.dialogApprove = true;
    },

    denyItem(item) {
      this.requestIndex = this.requests.indexOf(item);
      this.dialogDeny = true;
    },
    editItem(item) {
      this.getSupes();
      // all these fill the form with the selected person's info for editing
      this.editIndex = this.tminformation.indexOf(item);
      this.editTMNumber = this.tminformation[this.editIndex].tmnumber;
      this.editTMName = this.tminformation[this.editIndex].name;
      this.editTMTitle = this.tminformation[this.editIndex].title;
      this.editTMSupervisor = this.tminformation[this.editIndex].supervisor;
      this.editTMAnniversaryDate = this.tminformation[
        this.editIndex
      ].anniversary;
      this.editTMIsAdmin = this.tminformation[this.editIndex].isadmin;
      // this just opens the form itself
      this.dialogEdit = true;
    },

    deleteItem(item) {
      this.editIndex = this.tminformation.indexOf(item);
      this.dialogDelete = true;
    },

    deleteRequest(item) {
      this.historyIndex = this.history.indexOf(item);
      this.dialogDeleteRequest = true;
    },

    approveRequestConfirm() {
      this.requestApproveOrDeny(this.requests[this.requestIndex], true);
      this.closeApprove();
    },

    denyRequestConfirm() {
      this.requestApproveOrDeny(this.requests[this.requestIndex], false);
      this.closeDeny();
    },

    editTMConfirm() {
      // edit/update tm
      this.updateTM();
      this.closeEdit();
    },

    async addRequestConfirm() {
      // actually add the request to the db and table
      await this.addRequestForTM().catch((err) => {
        console.log(err);
      });
      // close the dialog
      this.closeTMRequest();
    },

    deleteTMConfirm() {
      // delete tm
      this.deleteTM();
      this.closeDelete();
    },

    deleteRequestConfirm() {
      // delete request
      // and close the dialog
      this.deleteArchivedRequest();
      this.closeDeleteRequest();
    },

    closeApprove() {
      this.dialogApprove = false;
      this.$nextTick(() => {
        this.requestIndex = -1;
      });
    },

    closeDeny() {
      this.dialogDeny = false;
      this.$nextTick(() => {
        this.requestIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editIndex = -1;
      });
    },
    closeDeleteRequest() {
      this.dialogDeleteRequest = false;
      this.$nextTick(() => {
        this.historyIndex = -1;
      });
    },
    closeEdit() {
      this.dialogEdit = false;
      this.$nextTick(() => {
        this.editIndex = -1;
      });
    },
    closeTMRequest() {
      this.dialogTMRequest = false;
    },

    async getSupes() {
      await usersCollection
        .where("IsAdmin", "==", true)
        .get()
        .then((collection) => {
          this.supervisors = [];
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            let name = temp.Full_Name;
            let email = temp.TM_Email;
            this.supervisors.push({
              // [name]: email,
              name: name,
              email: email,
            });
          });
        });
    },

    // delete a request forever
    async deleteArchivedRequest() {
      const querySnapshot = await db
        .collectionGroup("Requests")
        .where("Color", "==", "Pink")
        .get();
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });

      // console.log(this.historyIndex);
      // console.log(this.history[this.historyIndex]);
      // await db
      //   .collectionGroup("Requests")
      //   .where("Status", "==", "pending")
      //   .get();
      // .then((collection) => {
      //   collection.docs.forEach((doc) => {
      //     let temp = doc.data();
      //     this.requests.push({
      //       userID: temp.User_ID,
      //       requestID: doc.id,
      //       name: temp.Full_Name,
      //       requestdate: temp.Request_Date,
      //       ptotype: temp.Request_Type,
      //       startdate: temp.Start_Date,
      //       enddate: temp.End_Date,
      //       totalhours: temp.Total_Hours,
      //       description: temp.Description,
      //       supervisorid: temp.Supervisor_ID,
      //       supervisor: temp.Supervisor_Name,
      //       status: temp.Status,
      //       reason: temp.Reason,
      //       useremail: temp.TM_Email,
      //     });
      //   });
      // });
    },

    // delete a user FOREVER
    async deleteTM() {
      const userDelete = functions.httpsCallable("userDelete");
      let temp = this.editIndex;

      await userDelete({ userID: this.tminformation[temp].userID })
        .then((results) => {
          console.log(results);
          this.tminformation.splice(temp, 1); //use this when deleting a user from table
        })
        .catch((err) => {
          console.log(err);
        });
      //await usersCollection
      //  .doc(this.tminformation[temp].userID)
      //  .delete()
      //  .then(() => {
      //    this.tminformation.splice(temp, 1); //use this when deleting a user from table
      //  })
      //  .catch((err) => {
      //    console.log(err);
      //  });
    },

    // updates user info
    async updateTM() {
      let temp = this.editIndex;
      // actually change the db with edited info
      await usersCollection.doc(this.tminformation[temp].userID).update({
        Full_Name: this.editTMName,
        Anniversary_Date: this.editTMAnniversaryDate,
        Supervisor_Name:
          this.editTMSupervisor.name || this.tminformation[temp].supervisor,
        Supervisor_Email:
          this.editTMSupervisor.email ||
          this.tminformation[temp].supervisoremail,
        TM_Num: this.editTMNumber,
        Title: this.editTMTitle,
        IsAdmin: this.editTMIsAdmin,
      });

      // and now change the table info
      // could just make a call to the db tho
      this.tminformation[temp].tmnumber = this.editTMNumber;
      this.tminformation[temp].name = this.editTMName;
      this.tminformation[temp].title = this.editTMTitle;
      this.tminformation[temp].supervisor =
        this.editTMSupervisor.name || this.tminformation[temp].supervisor;
      this.tminformation[temp].supervisoremail =
        this.editTMSupervisor.email || this.tminformation[temp].supervisoremail;
      this.tminformation[temp].anniversary = this.editTMAnniversaryDate;
      this.tminformation[temp].isadmin = this.editTMIsAdmin;

      // to refresh the supervisor list
      this.getSupes();
    },

    async requestApproveOrDeny(request, approved) {
      let tempindex = this.requestIndex;
      var requestDoc = await usersCollection
        .doc(request.userID) // Gets doc that has user id
        .collection("Requests")
        .doc(request.requestID); // gets doc that has request id
      if (approved == true) {
        requestDoc.get().then((doc) => {
          let temp = doc.data();
          // If current doc in database is not update it, allow current admin to update it
          if (temp.Status == "pending") {
            requestDoc
              .update({
                Status: "approved",
              })
              .then(() => {
                // fire off email method call for approve
                this.emailApprove(this.requests[tempindex]);
                console.log("Doc successfully updated");
                // only splice request and push to history if no error occurred
                // Add method for emails here in future?
                console.log("selected thing: " + this.requests[tempindex]);
                console.log("requestIndex now: " + tempindex);
                this.requests[tempindex].status = "approved";
                this.history.unshift(this.requests[tempindex]);
                this.requests.splice(tempindex, 1);
              })
              .catch((err) => {
                console.log("Doc does not exist?");
                console.log(err);
              });
          } else {
            console.log(
              "Doc has already been approved or deny, please reload your page"
            );
          }
        });
      } else if (approved == false) {
        requestDoc.get().then((doc) => {
          let temp = doc.data();

          if (temp.Status == "pending") {
            requestDoc
              .update({
                Status: "denied",
                Reason: this.decline_reason,
              })
              .then(() => {
                console.log("Doc successfully updated");
                // only splice request and push to history if no error occurred
                // Add method for emails here in future?
                this.requests[tempindex].reason = this.decline_reason;
                this.requests[tempindex].status = "denied";
                // fire off email method call for deny
                this.emailDeny(this.requests[tempindex]);
                this.history.unshift(this.requests[tempindex]);
                this.requests.splice(tempindex, 1);
              })
              .catch((err) => {
                console.log("Doc does not exist?");
                console.log(err);
              });
          } else {
            console.log(
              "Doc has already been approved or deny, please reload your page"
            );
          }
        });
      } else {
        console.log("approved didn't have a valid value");
      }
    },

    async updateRequestsTable() {
      this.requests = [];
      await db
        .collectionGroup("Requests")
        .where("Status", "==", "pending")
        .get()
        .then((collection) => {
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            this.requests.push({
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
              useremail: temp.TM_Email,
            });
          });
        });
    },
    // Grabs request documents
    async queryRequests() {
      // fills request table
      await db
        .collectionGroup("Requests")
        .where("Status", "==", "pending")
        .get()
        .then((collection) => {
          collection.docs.forEach((doc) => {
            let temp = doc.data();
            this.requests.push({
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
              useremail: temp.TM_Email,
            });
          });
        });
      // fills request history table
      await db
        .collectionGroup("Requests")
        .where("Status", "!=", "pending")
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
              status: this.statusCapser(temp.Status),
              reason: temp.Reason,
            });
          });
        });
      // fills user table
      await usersCollection.get().then((collection) => {
        collection.docs.forEach((doc) => {
          let temp = doc.data();
          this.tminformation.push({
            userID: temp.User_ID,
            tm_ID: doc.uid,
            tmnumber: temp.TM_Num,
            name: temp.Full_Name,
            title: temp.Title,
            supervisor: temp.Supervisor_Name,
            supervisoremail: temp.Supervisor_Email,
            email: temp.TM_Email,
            anniversary: temp.Anniversary_Date,
            isadmin: temp.IsAdmin,
          });
        });
      });
    },

    statusCapser(lowercaseStatus) {
      if (lowercaseStatus == "approved") return "Approved";
      if (lowercaseStatus == "denied") return "Denied";
    },

    // need to refactor but basic functionality there
    async makeAdmin(editAdmin) {
      let temp = this.editIndex;
      const addAdminRole = functions.httpsCallable("addAdminRole");
      const removeAdminRole = functions.httpsCallable("removeAdminRole");

      if (editAdmin == true) {
        addAdminRole({ email: this.tminformation[temp].email })
          .then((result) => {
            console.log(result);
            console.log("Admin role is: " + result.data.admin);
          })
          .catch((err) => {
            console.log(err);
            this.editTMIsAdmin = false;
          });
      } else if (editAdmin == false) {
        removeAdminRole({ email: this.tminformation[temp].email })
          .then((result) => {
            console.log(result);

            // UPDATE CLOUD FUNCTION but this works
            if (result.data.error != true) {
              console.log("Admin role is: " + result.data.admin);
            } else {
              // log error here if its master account
              this.editTMIsAdmin = true;
            }
          })
          .catch((err) => {
            console.log(err);
            this.editTMIsAdmin = true;
          });
      }
    },
  },
};
</script>
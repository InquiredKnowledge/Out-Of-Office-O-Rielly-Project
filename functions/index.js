const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Adds email role to account with email that is sent through data
exports.addAdminRole = functions.https.onCall((data, context) => {
  // Only allows admins to access this account
  if (context.auth.token.admin !== true) {
    throw { message: "Only admins can access this function", error: true };
  }

  // get user and add custom claim (admin)
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then((user) => {
      admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      });
      admin
        .firestore()
        .collection("Users")
        .doc(user.uid)
        .update({
          IsAdmin: true,
        });
    })
    .then(() => {
      return {
        message: "Success! " + data.email + " has been made an admin",
        success: true,
        admin: true,
      };
    })
    .catch((err) => {
      return err;
    });
});

// Removes email role to account with email that is sent through data
exports.removeAdminRole = functions.https.onCall((data, context) => {
  // master account with this ID cannot have their admin role stripped from them from fellow admins
  const masterID = "rAQh3rYUCIVfvU7fu2qspfnE0At2";

  // Only allows admins to access this account
  if (context.auth.token.admin !== true) {
    throw { message: "Only admins can access this function", error: true };
  }

  // get user and add custom claim (admin)
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then((user) => {
      // if user id equals master ID, stop them from setting them to false
      if (user.uid != masterID) {
        admin.auth().setCustomUserClaims(user.uid, {
          admin: false,
        });
        admin
          .firestore()
          .collection("Users")
          .doc(user.uid)
          .update({
            IsAdmin: false,
          });
      } else {
        throw {
          message: "Cannot remove admin level status from the master account",
          error: true,
        };
      }
    })
    .then(() => {
      return {
        message: "Success! " + data.email + " has been stripped of the",
        success: true,
        admin: false,
      };
    })
    .catch((err) => {
      return err;
    });
});

// Grabs all supervisors or accounts where they have admin status
exports.grabSupervisors = functions.https.onCall(() => {
  let supervisors = [];

  // master account with this ID cannot have their admin role stripped from them from fellow admins
  const masterID = "rAQh3rYUCIVfvU7fu2qspfnE0At2";

  return admin
    .firestore()
    .collection("Users")
    .where("IsAdmin", "==", true)
    .get()
    .then((collection) => {
      collection.forEach((doc) => {
        let temp = doc.data();

        if (doc.id != masterID) {
          supervisors.push({
            name: temp.Full_Name,
            email: temp.TM_Email,
          });
        }
      });
    })
    .then(() => {
      return { supervisors };
    })
    .catch((err) => {
      //nothing for now
      console.log(err);
    });
});

exports.grabRequests = functions.https.onCall((data, context) => {
  let requests = [];

  // Only lets cloud function be used by auth user
  if (context.auth.token == null) {
    throw {
      message:
        "The console has been notified of an unautherized user accessing this function",
    };
  }

  // Grabs only approved requests and sends back limited fields from it
  return admin
    .firestore()
    .collectionGroup("Requests")
    .where("Status", "==", "approved")
    .get()
    .then((collection) => {
      collection.forEach((doc) => {
        let temp = doc.data();

        requests.push({
          name: temp.Full_Name,
          ptoType: temp.Request_Type,
          start: temp.Start_Date,
          end: temp.End_Date,
          color: temp.Color,
          supervisor: temp.Supervisor_Name,
        });
      });
    })
    .then(() => {
      return { requests };
    })
    .catch((err) => {
      //nothing for now
      console.log(err);
    });
});

exports.grabUsers = functions.https.onCall((data, context) => {
  let users = [];

  // master account with this ID cannot be grabbed
  const masterID = "rAQh3rYUCIVfvU7fu2qspfnE0At2";

  // Only lets cloud function be used by auth user
  if (context.auth.token == null) {
    throw {
      message:
        "The console has been notified of an unautherized user accessing this function",
    };
  }

  // Grabs only approved requests and sends back limited fields from it
  return admin
    .firestore()
    .collection("Users")
    .get()
    .then((collection) => {
      collection.forEach((doc) => {
        let temp = doc.data();

        if (doc.id != masterID) {
          users.push({
            fname: temp.Full_Name,
            id: temp.User_ID,
          });
        }
      });
    })
    .then(() => {
      return { users };
    })
    .catch((err) => {
      //nothing for now
      console.log(err);
    });
});

// Deletes users request on user doc delete
exports.userDelete = functions.https.onCall((data, context) => {
  // master account with this ID cannot be grabbed
  const masterID = "rAQh3rYUCIVfvU7fu2qspfnE0At2";

  if (context.auth.token.admin !== true) {
    throw { message: "Only admins can access this function", error: true };
  }

  // Prevents master account from being deleted
  if (data.userID != masterID) {
    // First deletes requests
    admin
      .firestore()
      .collection("Users")
      .doc(data.userID)
      .collection("Requests")
      .get()
      .then((collection) => {
        collection.forEach((doc) => {
          admin
            .firestore()
            .collection("Users")
            .doc(data.userID)
            .collection("Requests")
            .doc(doc.id)
            .delete();
        });
      })
      .then(() => {
        admin
          .firestore()
          .collection("Users")
          .doc(data.userID)
          .delete()
          .then(() => {
            // Deletes users account
            admin.auth().deleteUser(data.userID);
          })
          .catch((err) => {
            //nothing for now
            console.log(err);
          });
      })
      .catch((err) => {
        //nothing for now
        console.log(err);
      });
  }
  return {
    message: "Success! " + data.userID + " has been deleted",
    success: true,
  };
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });)

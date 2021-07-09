import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

const firebaseConfig = {
        //HIDDEN DOES NOT CONNECT
};

firebase.initializeApp(firebaseConfig);

// utils
const db = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.functions();

// collection references
const usersCollection = db.collection("Users");
const mailCollection = db.collection("Mail");

export { db, auth, functions, usersCollection, mailCollection };

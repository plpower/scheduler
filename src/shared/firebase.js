import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCmppenPvDvLR1nQ41ONn1yaeE_X2blSe0",
    authDomain: "scheduler-aa2af.firebaseapp.com",
    databaseURL: "https://scheduler-aa2af.firebaseio.com",
    projectId: "scheduler-aa2af",
    storageBucket: "scheduler-aa2af.appspot.com",
    messagingSenderId: "185928165166",
    appId: "1:185928165166:web:e7c65b689250f47325fcbf",
    measurementId: "G-W0WBNMHXBJ"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
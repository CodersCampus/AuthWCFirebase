
import { initializeApp } from "firebase/app";

import {
    getAuth
} from "firebase/auth";


import {
    getFirestore
} from "firebase/firestore";


export const config = {
    apiKey: "AIzaSyDIhcIW_rMTpNTldd7H6L22tLAaUUOPZ-w",
    authDomain: "firewise-pete-c.firebaseapp.com",
    projectId: "firewise-pete-c",
    storageBucket: "firewise-pete-c.appspot.com",
    messagingSenderId: "306688356910",
    appId: "1:306688356910:web:6c5df20f68fb6add84e5bf"
};


export const firebaseApp = initializeApp(config);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

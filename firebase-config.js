import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// លក្ខខណ្ឌតឹងរ៉ឹង៖ ផ្លាស់ប្តូរ Config នេះទៅជារបស់អ្នកនៅពេលក្រោយ
const firebaseConfig = {
    apiKey: "MOCK_API_KEY_FOR_INITIALIZATION",
    authDomain: "popms-app.firebaseapp.com",
    projectId: "popms-app",
    storageBucket: "popms-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:mock123"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
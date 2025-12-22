import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCvHvNoBWXnRtFYaVOJmm1wL96e84ZDErg",
    authDomain: "x-mas-song-guess.firebaseapp.com",
    databaseURL: "https://x-mas-song-guess-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "x-mas-song-guess",
    storageBucket: "x-mas-song-guess.firebasestorage.app",
    messagingSenderId: "542048017886",
    appId: "1:542048017886:web:df4d39c84e8d4d4ecd114f",
    measurementId: "G-BQ6XV0TSD3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

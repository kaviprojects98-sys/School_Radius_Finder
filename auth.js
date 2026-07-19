import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "schoolradiusfinder-b7597.firebaseapp.com",
    projectId: "schoolradiusfinder-b7597",
    storageBucket: "schoolradiusfinder-b7597.firebasestorage.app",
    messagingSenderId: "1049648379138",
    appId: "1:1049648379138:web:d756f1688264b30d3e3e1b",
    measurementId: "G-V69ZJT16YL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

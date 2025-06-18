// authCheck.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuliUOaOVvAr14JPKemiZBsUISMJy9R6I",
  authDomain: "museraya-1e747.firebaseapp.com",
  databaseURL: "https://museraya-1e747-default-rtdb.firebaseio.com",
  projectId: "museraya-1e747",
  storageBucket: "museraya-1e747.appspot.com",
  messagingSenderId: "235868279350",
  appId: "1:235868279350:web:ad4af197ca0118bbfd3e97",
  measurementId: "G-VCX0P5SZC8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user && user.email.endsWith("@admin.com")) {
    document.body.style.display = "flex"; // Or 'block' depending on your layout
    console.log("Admin authenticated:", user.email);
  } else {
    alert("Access denied. Please login as admin.");
    window.location.href = "index.html";
  }
});

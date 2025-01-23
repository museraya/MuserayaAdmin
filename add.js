import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add item to Firestore
document.getElementById("addButton").addEventListener("click", async () => {
    const id = document.getElementById("id").value.trim();
    const name = document.getElementById("name").value.trim();
    const info = document.getElementById("info").value.trim();

    if (id && name && info) {
        try {
            // Add a document with the 'id' as the document name
            const docRef = doc(db, "items", id);
            await setDoc(docRef, {
                name: name,
                info: info
            });
            alert("Item added successfully!");
            
            // Clear the input fields
            document.getElementById("id").value = '';
            document.getElementById("name").value = '';
            document.getElementById("info").value = '';
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error adding item.");
        }
    } else {
        alert("Please fill all fields.");
    }
});

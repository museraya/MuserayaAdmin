import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const db = getFirestore(app);

document.getElementById("addButton").addEventListener("click", async () => {
    const category = document.getElementById("category").value;
    const name = document.getElementById("name").value.trim();
    const info = document.getElementById("info").value.trim();
    const imageFile = document.getElementById("image").files[0];

    if (category && name && info && imageFile) {
        try {
            const imageUrl = await uploadImageToImgur(imageFile);

            const docRef = await addDoc(collection(db, category), {
                name: name,
                info: info,
                url: imageUrl
            });

            alert("Item added successfully! ID: " + docRef.id);

            document.getElementById("name").value = '';
            document.getElementById("info").value = '';
            document.getElementById("image").value = '';

        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error adding item.");
        }
    } else {
        alert("Please fill all fields and upload an image.");
    }
});

async function uploadImageToImgur(imageFile) {
    const clientId = "b21c768afa164c8";

    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
            Authorization: `Client-ID ${clientId}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (data.success) {
        return data.data.link;
    } else {
        throw new Error("Failed to upload image to Imgur");
    }
}

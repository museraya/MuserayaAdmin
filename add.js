import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// firebase
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

// Add button click handler
document.getElementById("addButton").addEventListener("click", async () => {
    // variables for button loading
    const addButton = document.getElementById("addButton");
    const loadingText = document.getElementById("loadingText");

    const category = document.getElementById("category").value;
    const name = document.getElementById("name").value.trim();
    const info = document.getElementById("info").value.trim();
    const coverFile = document.getElementById("cover").files[0]; 
    const imageReq = document.getElementById("image1").files[0];

    // Get up to 5 optional image files
    const imageFiles = [
        document.getElementById("image1").files[0],
        document.getElementById("image2").files[0],
        document.getElementById("image3").files[0],
        document.getElementById("image4").files[0],
        document.getElementById("image5").files[0]
    ];

    // Validate required fields
    if (category && name && info && coverFile && imageReq) {
        // start ng loading using if statement
        try {
            // Disable button and show loading
            addButton.disabled = true;
            addButton.style.backgroundColor = "#aaa";
            if (loadingText) loadingText.style.display = "block";

            // Upload the required cover image
            const coverUrl = await uploadImageToImgur(coverFile);

            // Upload only selected image files
            const imageUrls = await Promise.all(
                imageFiles.map(async (file) => {
                    if (file) {
                        return await uploadImageToImgur(file);
                    } else {
                        return null;
                    }
                })
            );

            // Prepare Firestore document data
            const data = {
                name: name,
                info: info,
                cover: coverUrl
            };

            // Add uploaded image URLs as url, url2, ..., url5
            imageUrls.forEach((url, index) => {
                if (url) {
                    const key = index === 0 ? "url" : `url${index + 1}`;
                    data[key] = url;
                }
            });

            // Save to Firestore
            const docRef = await addDoc(collection(db, category), data);

            alert("Item added successfully! ID: " + docRef.id);

            // Clear form
            document.getElementById("name").value = '';
            document.getElementById("info").value = '';
            document.getElementById("cover").value = '';
            for (let i = 1; i <= 5; i++) {
                document.getElementById(`image${i}`).value = '';
            }

        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error adding item.");
        } finally {
            // enable button after upload
            addButton.disabled = false;
            // button color
            addButton.style.backgroundColor = "#D16A3B";
            if (loadingText) loadingText.style.display = "none";
        }
    } else {
        alert("Please fill out category, name, info, atleast 1 image, and upload a cover photo.");
    }
});

// upload to imgur
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

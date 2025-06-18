import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuliUOaOVvAr14JPKemiZBsUISMJy9R6I",
    authDomain: "museraya-1e747.firebaseapp.com",
    projectId: "museraya-1e747",
    storageBucket: "museraya-1e747.appspot.com",
    messagingSenderId: "235868279350",
    appId: "1:235868279350:web:ad4af197ca0118bbfd3e97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = ["audio", "film", "music", "art", "misc"];

async function loadItems() {
    try {
        for (let category of categories) {
            const itemsCollection = collection(db, category);
            const itemsSnapshot = await getDocs(itemsCollection);
            const tableBody = document.getElementById(`${category}TableBody`);
            tableBody.innerHTML = "";

            itemsSnapshot.forEach(docSnapshot => {
                const item = docSnapshot.data();
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><span id="name-${category}-${docSnapshot.id}">${item.name}</span></td>
                    <td><span id="info-${category}-${docSnapshot.id}">${item.info}</span></td>
                    <td>
                        <img id="url-${category}-${docSnapshot.id}" src="${item.url}" alt="Image"
                             style="max-width: 100px; max-height: 100px; object-fit: cover;"
                             referrerpolicy="no-referrer"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=No+Image';">
                    </td>
                    <td>
                        <img id="cover-${category}-${docSnapshot.id}" src="${item.cover}" alt="Cover"
                             style="max-width: 100px; max-height: 100px; object-fit: cover;"
                             referrerpolicy="no-referrer"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=No+Cover';">
                    </td>
                    <td>
                        <button class="edit" onclick="editItem('${category}', '${docSnapshot.id}')">Edit</button>
                        <button class="save" onclick="updateItem('${category}', '${docSnapshot.id}')">Save</button>
                        <button class="delete" onclick="deleteItem('${category}', '${docSnapshot.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error loading items:", error);
    }
}

function editItem(category, docId) {
    const nameField = document.getElementById(`name-${category}-${docId}`);
    const infoField = document.getElementById(`info-${category}-${docId}`);
    const urlImg = document.getElementById(`url-${category}-${docId}`);
    const coverImg = document.getElementById(`cover-${category}-${docId}`);

    // Replace text fields with inputs
    nameField.innerHTML = `<input type="text" value="${nameField.innerText}" id="edit-name-${category}-${docId}" class="edit-input">`;
    infoField.innerHTML = `<textarea id="edit-info-${category}-${docId}" class="edit-textarea">${infoField.innerText}</textarea>`;

    // Replace images with:
    // 1) text input for URL (hidden link that will be updated on file upload)
    // 2) file input to select new image and upload to Imgur
    urlImg.outerHTML = `
        <div>
            <input type="text" id="edit-url-${category}-${docId}" value="${urlImg.src}" class="edit-input" readonly style="width: 90%;">
            <input type="file" id="edit-url-file-${category}-${docId}" accept="image/*" style="margin-top:5px;">
        </div>
    `;

    coverImg.outerHTML = `
        <div>
            <input type="text" id="edit-cover-${category}-${docId}" value="${coverImg.src}" class="edit-input" readonly style="width: 90%;">
            <input type="file" id="edit-cover-file-${category}-${docId}" accept="image/*" style="margin-top:5px;">
        </div>
    `;

    // Add event listeners for the file inputs to upload immediately on file selection
    setTimeout(() => {
        const urlFileInput = document.getElementById(`edit-url-file-${category}-${docId}`);
        const coverFileInput = document.getElementById(`edit-cover-file-${category}-${docId}`);

        if (urlFileInput) {
            urlFileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                try {
                    const link = await uploadImageToImgur(file);
                    document.getElementById(`edit-url-${category}-${docId}`).value = link;
                    console.log("URL image uploaded, link updated.");
                } catch (error) {
                    alert("Failed to upload URL image to Imgur.");
                    console.error(error);
                }
            });
        }

        if (coverFileInput) {
            coverFileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                try {
                    const link = await uploadImageToImgur(file);
                    document.getElementById(`edit-cover-${category}-${docId}`).value = link;
                    console.log("Cover image uploaded, link updated.");
                } catch (error) {
                    alert("Failed to upload Cover image to Imgur.");
                    console.error(error);
                }
            });
        }
    }, 100); // small delay to ensure inputs are in DOM
}

async function updateItem(category, docId) {
    const nameValue = document.getElementById(`edit-name-${category}-${docId}`).value;
    const infoValue = document.getElementById(`edit-info-${category}-${docId}`).value;
    const urlValue = document.getElementById(`edit-url-${category}-${docId}`).value;
    const coverValue = document.getElementById(`edit-cover-${category}-${docId}`).value;

    try {
        const docRef = doc(db, category, docId);
        await updateDoc(docRef, {
            name: nameValue,
            info: infoValue,
            url: urlValue,
            cover: coverValue
        });
        alert(`Item updated in ${category}`);
        loadItems();
    } catch (error) {
        console.error("Error updating item:", error);
    }
}

async function deleteItem(category, docId) {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
        const docRef = doc(db, category, docId);
        await deleteDoc(docRef);
        alert(`Item deleted from ${category}`);
        loadItems();
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

// Imgur upload function (same as your provided one)
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

window.editItem = editItem;
window.updateItem = updateItem;
window.deleteItem = deleteItem;
window.onload = loadItems;

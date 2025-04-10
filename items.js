// items.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

const categories = ["audio", "film", "music", "art"];

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
                
                // Debugging: Log the image URL to the console
                console.log("Image URL:", item.url); 

                row.innerHTML = `
                    <td><span id="name-${category}-${docSnapshot.id}">${item.name}</span></td>
                    <td><span id="info-${category}-${docSnapshot.id}">${item.info}</span></td>
                    <td><span id="url-${category}-${docSnapshot.id}">${item.url}</span></td>
                    <td class="image-column"><img src="${item.url}" alt="${item.name}" style="max-width: 100px; max-height: 100px;"></td>
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
    const urlField = document.getElementById(`url-${category}-${docId}`);

    nameField.innerHTML = `<input type="text" value="${nameField.innerText}" id="edit-name-${category}-${docId}" style="width: 500; height: 40px; font-size: 16px;">`;
    infoField.innerHTML = `<textarea id="edit-info-${category}-${docId}" style="width: 1000px; height: 100px; font-size: 16px;">${infoField.innerText}</textarea>`;
    urlField.innerHTML = `<input type="text" value="${urlField.innerText}" id="edit-url-${category}-${docId}" style="width: 1000px; height: 40px; font-size: 16px;">`;
}

async function updateItem(category, docId) {
    const nameValue = document.getElementById(`edit-name-${category}-${docId}`).value;
    const infoValue = document.getElementById(`edit-info-${category}-${docId}`).value;
    const urlValue = document.getElementById(`edit-url-${category}-${docId}`).value;

    try {
        const docRef = doc(db, category, docId);
        await updateDoc(docRef, { name: nameValue, info: infoValue, url: urlValue });
        alert(`Item updated in ${category}`);
        loadItems(); // Refresh table
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
        loadItems(); // Refresh table
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

window.editItem = editItem;
window.updateItem = updateItem;
window.deleteItem = deleteItem;
window.onload = loadItems;
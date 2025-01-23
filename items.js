import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

async function loadItems() {
    const itemsCollection = collection(db, "items");
    const itemsSnapshot = await getDocs(itemsCollection);
    const tableBody = document.getElementById("itemsTableBody");
    tableBody.innerHTML = "";
    itemsSnapshot.forEach(docSnapshot => {
        const item = docSnapshot.data();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${docSnapshot.id}</td>
            <td><span id="name-${docSnapshot.id}">${item.name}</span></td>
            <td><span id="info-${docSnapshot.id}">${item.info}</span></td>
            <td>
                <button class="edit" onclick="editItem('${docSnapshot.id}')">Edit</button>
                <button class="accept" onclick="updateItem('${docSnapshot.id}')">Save</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editItem(docId) {
    const nameField = document.getElementById(`name-${docId}`);
    const infoField = document.getElementById(`info-${docId}`);

    // Create input elements for editing
    nameField.innerHTML = `<input type="text" value="${nameField.innerText}" id="edit-name-${docId}">`;
    infoField.innerHTML = `<input type="text" value="${infoField.innerText}" id="edit-info-${docId}">`;
}

async function updateItem(docId) {
    const nameField = document.getElementById(`edit-name-${docId}`).value;
    const infoField = document.getElementById(`edit-info-${docId}`).value;
    try {
        const docRef = doc(db, "items", docId);
        await updateDoc(docRef, { name: nameField, info: infoField });
        alert(`Item ${docId} has been updated`);
        loadItems();
    } catch (error) {
        console.error("Error updating item:", error);
    }
}

window.editItem = editItem;
window.updateItem = updateItem;
window.onload = loadItems;

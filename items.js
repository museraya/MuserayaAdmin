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

                // Function to generate image HTML or placeholder
                const getImageHtml = (url, id, altText) => `
                    <img id="${id}" src="${url || 'https://via.placeholder.com/100?text=No+Image'}" alt="${altText}"
                         style="max-width: 100px; max-height: 100px; object-fit: cover;"
                         referrerpolicy="no-referrer"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=No+Image';">
                `;
                // Function to generate cover image HTML or placeholder
                const getCoverImageHtml = (url, id, altText) => `
                    <img id="${id}" src="${url || 'https://via.placeholder.com/100?text=No+Cover'}" alt="${altText}"
                         style="max-width: 100px; max-height: 100px; object-fit: cover;"
                         referrerpolicy="no-referrer"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=No+Cover';">
                `;


                row.innerHTML = `
                    <td><span id="name-${category}-${docSnapshot.id}">${item.name || ''}</span></td>
                    <td><span id="info-${category}-${docSnapshot.id}">${item.info || ''}</span></td>
                <td>
                    <div>${getImageHtml(item.url, `url-${category}-${docSnapshot.id}`, 'Image')}</div>
                    <div>${getImageHtml(item.url2, `url2-${category}-${docSnapshot.id}`, 'Image 2')}</div>
                    <div>${getImageHtml(item.url3, `url3-${category}-${docSnapshot.id}`, 'Image 3')}</div>
                    <div>${getImageHtml(item.url4, `url4-${category}-${docSnapshot.id}`, 'Image 4')}</div>
                    <div>${getImageHtml(item.url5, `url5-${category}-${docSnapshot.id}`, 'Image 5')}</div>
                </td>
                <td>
                    ${getCoverImageHtml(item.cover, `cover-${category}-${docSnapshot.id}`, 'Cover')}
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
    const url2Img = document.getElementById(`url2-${category}-${docId}`); // Added
    const url3Img = document.getElementById(`url3-${category}-${docId}`); // Added
    const url4Img = document.getElementById(`url4-${category}-${docId}`); // Added
    const url5Img = document.getElementById(`url5-${category}-${docId}`); // Added
    const coverImg = document.getElementById(`cover-${category}-${docId}`);

    // Helper function to create image input HTML
    const createImageInputHtml = (idPrefix, currentSrc) => `
        <div style="margin-bottom: 10px;">
            <input type="text" id="edit-${idPrefix}-${category}-${docId}" value="${currentSrc}" class="edit-input" readonly style="width: 70%;">
            <input type="file" id="edit-${idPrefix}-file-${category}-${docId}" accept="image/*">
            <button type="button" class="delete-image-btn" onclick="deleteImageField('${category}', '${docId}', '${idPrefix}')">🗑</button>
        </div>
    `;
    async function deleteImageField(category, docId, field) {
        const confirmDelete = confirm(`Are you sure you want to delete the image in ${field}?`);
        if (!confirmDelete) return;

        try {
            const docRef = doc(db, category, docId);
            const updateData = {};
            updateData[field] = ""; // Clear the image URL field
            await updateDoc(docRef, updateData);

            alert(`${field} removed successfully.`);
            loadItems();
        } catch (error) {
            console.error(`Error deleting ${field} field:`, error);
        }
    }

    window.deleteImageField = deleteImageField;

    // Helper function to attach event listener for file uploads
    const attachFileInputListener = (idPrefix) => {
        const fileInput = document.getElementById(`edit-${idPrefix}-file-${category}-${docId}`);
        if (fileInput) {
            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                try {
                    const link = await uploadImageToImgur(file);
                    document.getElementById(`edit-${idPrefix}-${category}-${docId}`).value = link;
                    console.log(`${idPrefix} image uploaded, link updated.`);
                } catch (error) {
                    alert(`Failed to upload ${idPrefix} image to Imgur.`);
                    console.error(error);
                }
            });
        }
    };


    // Replace text fields with inputs
    nameField.innerHTML = `<input type="text" value="${nameField.innerText}" id="edit-name-${category}-${docId}" class="edit-input">`;
    infoField.innerHTML = `<textarea id="edit-info-${category}-${docId}" class="edit-textarea">${infoField.innerText}</textarea>`;

    // Replace image elements with input fields and file uploaders
    const imageTd = urlImg.closest('td');
    imageTd.innerHTML = `
        ${createImageInputHtml('url', urlImg.src)}
        ${createImageInputHtml('url2', url2Img?.src || '')}
        ${createImageInputHtml('url3', url3Img?.src || '')}
        ${createImageInputHtml('url4', url4Img?.src || '')}
        ${createImageInputHtml('url5', url5Img?.src || '')}
    `;

    const coverTd = coverImg.closest('td');
    coverTd.innerHTML = createImageInputHtml('cover', coverImg.src);

    // Add event listeners for the file inputs to upload immediately on file selection
    setTimeout(() => {
        attachFileInputListener('url');
        attachFileInputListener('url2'); // Added
        attachFileInputListener('url3'); // Added
        attachFileInputListener('url4'); // Added
        attachFileInputListener('url5'); // Added
        attachFileInputListener('cover');
    }, 100); // small delay to ensure inputs are in DOM
}

async function updateItem(category, docId) {
    const nameValue = document.getElementById(`edit-name-${category}-${docId}`).value;
    const infoValue = document.getElementById(`edit-info-${category}-${docId}`).value;
    const urlValue = document.getElementById(`edit-url-${category}-${docId}`).value;
    const url2Value = document.getElementById(`edit-url2-${category}-${docId}`)?.value || ''; // Added, with fallback
    const url3Value = document.getElementById(`edit-url3-${category}-${docId}`)?.value || ''; // Added, with fallback
    const url4Value = document.getElementById(`edit-url4-${category}-${docId}`)?.value || ''; // Added, with fallback
    const url5Value = document.getElementById(`edit-url5-${category}-${docId}`)?.value || ''; // Added, with fallback
    const coverValue = document.getElementById(`edit-cover-${category}-${docId}`).value;

    try {
        const docRef = doc(db, category, docId);
        await updateDoc(docRef, {
            name: nameValue,
            info: infoValue,
            url: urlValue,
            url2: url2Value, // Added
            url3: url3Value, // Added
            url4: url4Value, // Added
            url5: url5Value, // Added
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
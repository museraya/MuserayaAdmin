import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

function formatDate(timestamp) {
    if (timestamp instanceof Timestamp) {
        const date = timestamp.toDate();
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' };
        return date.toLocaleString('en-US', options);
    }
    return '';
}

async function loadBookings() {
    const bookingCollection = collection(db, "booking");
    const bookingsSnapshot = await getDocs(bookingCollection);

    // Clear previous data
    const pendingTableBody = document.getElementById("pendingBookingTableBody");
    const acceptedTableBody = document.getElementById("acceptedBookingTableBody");
    const rejectedTableBody = document.getElementById("rejectedBookingTableBody");
    pendingTableBody.innerHTML = "";
    acceptedTableBody.innerHTML = "";
    rejectedTableBody.innerHTML = "";

    const bookings = [];

    bookingsSnapshot.forEach(docSnapshot => {
        const booking = docSnapshot.data();
        booking.id = docSnapshot.id; // Add the document ID
        bookings.push(booking);
    });

    // Sort bookings by date (closest to farthest)
    bookings.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateA - dateB; // Ascending order: closest date first
    });

    // Loop through bookings and categorize them based on status
    bookings.forEach(booking => {
        const formattedDate = formatDate(booking.date);
        const formattedDateCreated = formatDate(booking.date_created);
        const row = document.createElement("tr");
        const statusClass = booking.status === "accepted" ? "status-accepted" : booking.status === "rejected" ? "status-rejected" : "";

        row.innerHTML = `
            <td>${booking.name}</td>
            <td>${booking.email}</td>
            <td>${booking.quantity}</td>
            <td>${formattedDate}</td>
            <td>${formattedDateCreated}</td>
            <td><span class="${statusClass}">${booking.status}</span></td>
        `;

        // Add action buttons
        if (booking.status === "pending") {
            row.innerHTML += `
                <td>
                    <button class="accept" onclick="updateStatus('${booking.id}', 'accepted')">Accept</button>
                    <button class="reject" onclick="updateStatus('${booking.id}', 'rejected')">Reject</button>
                    <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
                </td>
            `;
            pendingTableBody.appendChild(row);
        } else if (booking.status === "accepted") {
            row.innerHTML += `
                <td>
                    <button class="reject" onclick="updateStatus('${booking.id}', 'rejected')">Reject</button>
                    <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
                </td>
            `;
            acceptedTableBody.appendChild(row);
        } else if (booking.status === "rejected") {
            row.innerHTML += `
                <td>
                    <button class="accept" onclick="updateStatus('${booking.id}', 'accepted')">Accept</button>
                    <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
                </td>
            `;
            rejectedTableBody.appendChild(row);
        }
    });
}

async function updateStatus(docId, status) {
    try {
        const docRef = doc(db, "booking", docId);
        await updateDoc(docRef, { status });
        alert(`Booking ${docId} has been ${status}`);
        loadBookings();
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

async function deleteBooking(docId) {
    try {
        const docRef = doc(db, "booking", docId);
        await deleteDoc(docRef);
        alert(`Booking ${docId} has been deleted`);
        loadBookings();
    } catch (error) {
        console.error("Error deleting booking:", error);
    }
}

window.updateStatus = updateStatus;
window.deleteBooking = deleteBooking;
window.onload = loadBookings;

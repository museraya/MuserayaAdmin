import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
    const options = {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: true, timeZone: 'Asia/Manila'
    };
    return date.toLocaleString('en-US', options);
  }
  return '';
}

async function loadBookings() {
  const bookingCollection = collection(db, "booking");
  const bookingsSnapshot = await getDocs(bookingCollection);

  const pendingTableBody = document.getElementById("pendingBookingTableBody");
  const acceptedTableBody = document.getElementById("acceptedBookingTableBody");
  const declinedTableBody = document.getElementById("declinedBookingTableBody");
  pendingTableBody.innerHTML = "";
  acceptedTableBody.innerHTML = "";
  declinedTableBody.innerHTML = "";

  const calendarEvents = [];

  const bookings = [];
  bookingsSnapshot.forEach(docSnapshot => {
    const booking = docSnapshot.data();
    booking.id = docSnapshot.id;
    bookings.push(booking);
  });

  bookings.sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
    const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
    return dateA - dateB;
  });

  bookings.forEach(booking => {
    const formattedDate = formatDate(booking.date);
    const formattedDateCreated = formatDate(booking.date_created);
    const row = document.createElement("tr");
    const statusClass = booking.status === "accepted" ? "status-accepted" :
                        booking.status === "declined" ? "status-declined" : "";

    row.innerHTML = `
      <td>${booking.name}</td>
      <td>${booking.email}</td>
      <td>${booking.contact || 'N/A'}</td>
      <td>${booking.quantity}</td>
      <td>${formattedDate}</td>
      <td>${formattedDateCreated}</td>
      <td><span class="${statusClass}">${booking.status}</span></td>
    `;

    const timestampDate = booking.date instanceof Timestamp ? booking.date.toDate() : new Date(booking.date);

    calendarEvents.push({
      title: booking.name,
      start: timestampDate.toISOString(),
      color: booking.status === "accepted" ? "green" : booking.status === "declined" ? "red" : "orange"
    });

    if (booking.status === "pending") {
      row.innerHTML += `
        <td>
          <button class="accept" onclick="updateStatus('${booking.id}', 'accepted')">Accept</button>
          <button class="decline" onclick="updateStatus('${booking.id}', 'declined')">Decline</button>
          <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
        </td>
      `;
      pendingTableBody.appendChild(row);
    } else if (booking.status === "accepted") {
      row.innerHTML += `
        <td>
          <button class="decline" onclick="updateStatus('${booking.id}', 'declined')">Decline</button>
          <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
        </td>
      `;
      acceptedTableBody.appendChild(row);
    } else if (booking.status === "declined") {
      row.innerHTML += `
        <td>
          <button class="accept" onclick="updateStatus('${booking.id}', 'accepted')">Accept</button>
          <button class="delete" onclick="deleteBooking('${booking.id}')">Delete</button>
        </td>
      `;
      declinedTableBody.appendChild(row);
      if (booking.reason) {
        const reasonRow = document.createElement("tr");
        reasonRow.innerHTML = `
          <td colspan="8" style="color: #b00020; font-style: italic;">
            Reason: ${booking.reason}
          </td>
        `;
        declinedTableBody.appendChild(reasonRow);
      }
    }
  });

  renderCalendar(calendarEvents);
}

async function updateStatus(docId, status) {
  try {
    const docRef = doc(db, "booking", docId);
    let updateData = { status };

    if (status === "declined") {
      const reason = prompt("Please enter the reason for declining this appointment:");
      if (reason === null || reason.trim() === "") {
        alert("Decline cancelled. Reason is required.");
        return;
      }
      updateData.reason = reason.trim();
    }

    await updateDoc(docRef, updateData);
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

function renderCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = "";

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 600,
    events: events
  });

  calendar.render();
}

window.updateStatus = updateStatus;
window.deleteBooking = deleteBooking;
window.onload = loadBookings;

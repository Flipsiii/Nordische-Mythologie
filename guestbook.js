// 1. Firebase Importe
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. DEINE KONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

// 3. Firebase starten
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Funktion zum Speichern
async function eintragSenden() {
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    const btn = document.getElementById('submitEntryBtn');

    const name = nameInput.value;
    const message = messageInput.value;

    if (name === "" || message === "") {
        alert("Die Götter verlangen einen Namen und eine Nachricht!");
        return;
    }

    try {
        btn.disabled = true; 
        btn.innerText = "Wird gemeißelt...";

        await addDoc(collection(db, "gaestebuch"), {
            name: name,
            message: message,
            timestamp: serverTimestamp(),
            dateString: new Date().toLocaleDateString('de-DE') + ' um ' + new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
        });

        // Felder leeren
        nameInput.value = "";
        messageInput.value = "";
        btn.disabled = false;
        btn.innerText = "In Stein meißeln";

    } catch (e) {
        console.error("Fehler beim Senden: ", e);
        alert("Ein Fehler ist aufgetreten. Loki treibt sein Unwesen!");
        btn.disabled = false;
        btn.innerText = "In Stein meißeln";
    }
}

// 5. Echtzeit-Listener (Daten empfangen)
function liveAbfrageStarten() {
    const container = document.getElementById('guestbook-entries');
    
    // Sortiert nach Zeit (neueste oben)
    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        container.innerHTML = ""; 

        if (snapshot.empty) {
            container.innerHTML = "<p style='text-align:center; color:#ccc;'>Noch ist es ruhig in den Hallen...</p>";
        }

        snapshot.forEach((doc) => {
            const daten = doc.data();
            const div = document.createElement('div');
            div.classList.add('entry');
            
            const datum = daten.dateString || "Gerade eben";

            div.innerHTML = `
                <div class="entry-header">
                    <span class="name">⚔️ ${daten.name}</span>
                    <span class="date">${datum}</span>
                </div>
                <div class="message">${daten.message}</div>
            `;
            container.appendChild(div);
        });
    }, (error) => {
        console.error("Fehler beim Empfangen der Daten:", error);
    });
}

// 6. Starten
const submitBtn = document.getElementById('submitEntryBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', eintragSenden);
}

liveAbfrageStarten();
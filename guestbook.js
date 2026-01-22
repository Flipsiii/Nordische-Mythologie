// 1. Wir importieren die Firebase-Funktionen direkt aus dem Internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. DEINE KONFIGURATION (Hier musst du DEINE Daten von der Firebase-Website einfügen!)
// Kopiere den Block von der Firebase-Konsole und ersetze diesen hier:
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
};

// 3. Firebase starten
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Funktion zum Speichern (Senden an Datenbank)
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
        btn.disabled = true; // Button sperren, damit man nicht doppelt klickt
        btn.innerText = "Wird gemeißelt...";

        // Wir schreiben in die Sammlung "gästebuch"
        await addDoc(collection(db, "gaestebuch"), {
            name: name,
            message: message,
            // Wir lassen den Server die Zeit bestimmen (wichtig für Sortierung!)
            timestamp: serverTimestamp(),
            // Optional: Ein formatiertes Datum für die Anzeige speichern
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

// 5. Echtzeit-Listener (Hört auf neue Einträge)
// Das hier ersetzt "ladeEintraege". Es läuft AUTOMATISCH, wenn jemand anderes etwas postet!
function liveAbfrageStarten() {
    const container = document.getElementById('guestbook-entries');
    
    // Wir fragen die Sammlung "gaestebuch" ab, sortiert nach Zeit (neueste oben)
    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));

    // onSnapshot läuft immer dann, wenn sich in der Datenbank etwas ändert
    onSnapshot(q, (snapshot) => {
        container.innerHTML = ""; // Liste leeren

        if (snapshot.empty) {
            container.innerHTML = "<p style='text-align:center; color:#ccc;'>Noch ist es ruhig in den Hallen...</p>";
        }

        snapshot.forEach((doc) => {
            const daten = doc.data();
            
            // HTML Bauen
            const div = document.createElement('div');
            div.classList.add('entry');
            
            // Falls timestamp noch lädt (Latenz), nehmen wir "Gerade eben"
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
    });
}

// 6. Event Listener setzen (Startet alles, wenn die Seite geladen ist)
// Da wir "module" nutzen, können wir nicht onclick im HTML nutzen.
document.getElementById('submitEntryBtn').addEventListener('click', eintragSenden);

// Live-Abfrage sofort starten
liveAbfrageStarten();
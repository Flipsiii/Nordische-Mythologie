console.log("Skript gestartet! Lade Module...");

// 1. Wir importieren die Firebase-Funktionen direkt aus dem Internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("Module geladen. Konfiguriere Firebase...");

// 2. DEINE KONFIGURATION
// Hier sind jetzt deine echten Daten eingetragen:
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
console.log("Datenbank verbunden.");

// 4. Funktion zum Speichern (Senden an Datenbank)
async function eintragSenden() {
    console.log("Button wurde geklickt!");
    
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    const btn = document.getElementById('submitEntryBtn');

    const name = nameInput.value;
    const message = messageInput.value;

    console.log("Name:", name, "Nachricht:", message);

    if (name === "" || message === "") {
        alert("Die Götter verlangen einen Namen und eine Nachricht!");
        return;
    }

    try {
        btn.disabled = true; // Button sperren, damit man nicht doppelt klickt
        btn.innerText = "Wird gemeißelt...";

        console.log("Sende Daten an Firebase...");

        // Wir schreiben in die Sammlung "gaestebuch"
        await addDoc(collection(db, "gaestebuch"), {
            name: name,
            message: message,
            // Wir lassen den Server die Zeit bestimmen (wichtig für Sortierung!)
            timestamp: serverTimestamp(),
            // Optional: Ein formatiertes Datum für die Anzeige speichern
            dateString: new Date().toLocaleDateString('de-DE') + ' um ' + new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
        });

        console.log("Erfolg! Daten gesendet.");

        // Felder leeren
        nameInput.value = "";
        messageInput.value = "";
        btn.disabled = false;
        btn.innerText = "In Stein meißeln";

    } catch (e) {
        console.error("FEHLER beim Senden: ", e);
        alert("Ein Fehler ist aufgetreten. Loki treibt sein Unwesen: " + e.message);
        btn.disabled = false;
        btn.innerText = "In Stein meißeln";
    }
}

// 5. Echtzeit-Listener (Hört auf neue Einträge)
function liveAbfrageStarten() {
    console.log("Starte Live-Abfrage...");
    const container = document.getElementById('guestbook-entries');
    
    // Wir fragen die Sammlung "gaestebuch" ab, sortiert nach Zeit (neueste oben)
    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));

    // onSnapshot läuft immer dann, wenn sich in der Datenbank etwas ändert
    onSnapshot(q, (snapshot) => {
        console.log("Neue Daten empfangen! Anzahl Einträge:", snapshot.size);
        container.innerHTML = ""; // Liste leeren

        if (snapshot.empty) {
            container.innerHTML = "<p style='text-align:center; color:#ccc;'>Noch ist es ruhig in den Hallen...</p>";
        }

        snapshot.forEach((doc) => {
            const daten = doc.data();
            
            // HTML Bauen
            const div = document.createElement('div');
            div.classList.add('entry');
            
            // Falls timestamp noch lädt (Latenz), nehmen wir "Gerade eben" oder den gespeicherten String
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

// 6. Event Listener setzen (Startet alles, wenn die Seite geladen ist)
const submitBtn = document.getElementById('submitEntryBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', eintragSenden);
    console.log("Event-Listener auf Button gesetzt.");
} else {
    console.error("FEHLER: Button mit ID 'submitEntryBtn' wurde im HTML nicht gefunden!");
}

// Live-Abfrage sofort starten
liveAbfrageStarten();
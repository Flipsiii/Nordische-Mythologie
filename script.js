console.log("Skript gestartet! Lade Module...");

// 1. Wir importieren die Firebase-Funktionen direkt aus dem Internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. DEINE ECHTE KONFIGURATION
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


// ==========================================
// TEIL A: GÄSTEBUCH LOGIK
// ==========================================

async function eintragSenden() {
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    const btn = document.getElementById('submitEntryBtn');

    // Wenn wir nicht auf der Gästebuch-Seite sind, brechen wir ab
    if (!nameInput || !messageInput || !btn) return;

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
        alert("Ein Fehler ist aufgetreten. Loki treibt sein Unwesen: " + e.message);
        btn.disabled = false;
        btn.innerText = "In Stein meißeln";
    }
}

// Echtzeit-Listener (Hört auf neue Einträge)
function liveAbfrageStarten() {
    const container = document.getElementById('guestbook-entries');
    
    // Wenn wir nicht auf der Gästebuch-Seite sind, brechen wir ab
    if (!container) return;
    
    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        container.innerHTML = ""; // Liste leeren

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

// Event Listener für den Button setzen
const submitBtn = document.getElementById('submitEntryBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', eintragSenden);
}

// Live-Abfrage starten (nur wenn container da ist)
liveAbfrageStarten();


// ==========================================
// TEIL B: RUNEN ÜBERSETZER
// ==========================================

// Wir machen die Funktion global verfügbar (window.), damit HTML sie findet
window.uebersetzeInRunen = function() {
    const runenAlphabet = {
        'a': 'ᚨ', 'b': 'ᛒ', 'c': 'ᚲ', 'd': 'ᛞ', 'e': 'ᛖ',
        'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚺ', 'i': 'ᛁ', 'j': 'ᛃ',
        'k': 'ᚲ', 'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᛟ',
        'p': 'ᛈ', 'q': 'ᚲ', 'r': 'ᚱ', 's': 'ᛊ', 't': 'ᛏ',
        'u': 'ᚢ', 'v': 'ᚹ', 'w': 'ᚹ', 'x': 'ᛒ', 'y': 'ᛃ',
        'z': 'ᛉ', ' ': ' ', 'ä': 'ᛇ', 'ö': 'ᛟ', 'ü': 'ᚢ'
    };
    
    const input = document.getElementById('meinInput');
    const output = document.getElementById('runenAusgabe');
    
    // Abbruch, wenn Elemente nicht da sind (z.B. auf anderen Seiten)
    if (!input || !output) return;

    const text = input.value.toLowerCase();
    let ergebnis = "";
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // Wenn Buchstabe bekannt, nimm Rune, sonst das Originalzeichen
        ergebnis += runenAlphabet[char] || char;
    }
    
    if (ergebnis === "") {
        output.innerText = "...";
    } else {
        output.innerText = ergebnis;
    }
};


// ==========================================
// TEIL C: HÁVAMÁL GENERATOR (Odins Weisheiten)
// ==========================================

const havamalSprueche = [
    "Ein Brand entbrennt am anderen, bis er verbrannt ist; ein Feuer entzündet sich am anderen. Der Mensch wird durch den Menschen klug, aber durch Überheblichkeit dumm.",
    "Besser ist keine Last, die man nach Hause trägt, als viel Menschenverstand. Er ist besser als Reichtum an fremden Orten; er ist das Heil der Armen.",
    "Der Unweise, wenn er zum Volke kommt, so schweigt er am besten still. Niemand weiß es, dass er nichts versteht, wenn er nicht zu viel spricht.",
    "Den Weg zum Freunde, sei er auch weit, geh oft und pflege ihn. Denn Gestrüpp wächst und hohes Gras auf dem Weg, den niemand geht.",
    "Vieh stirbt, Freunde sterben, endlich stirbt man selbst. Doch eines weiß ich, das niemals stirbt: Das Urteil über den Toten.",
    "Ein eigener Herd ist Goldes wert, und wär's nur 'ne Hütte klein. Ein jeder ist Herr in seinem Haus, und wär's nur zwei Ziegen groß.",
    "Mäßig klug sei jedermann, nicht allzu klug. Denn das Herz ist selten froh, wenn der Verstand zu viel weiß.",
    "Früh aufstehen muss, wer eines anderen Gut oder Leben will. Der liegende Wolf fängt selten das Schaf, noch der schlafende Mann den Sieg."
];

window.zeigeWeisheit = function() {
    const ausgabe = document.getElementById('havamalAusgabe');
    if (!ausgabe) return;
    
    // Zufälligen Spruch wählen
    const zufallsIndex = Math.floor(Math.random() * havamalSprueche.length);
    
    // Kleiner Fade-Out/In Effekt
    ausgabe.style.opacity = 0;
    setTimeout(() => {
        ausgabe.innerText = '"' + havamalSprueche[zufallsIndex] + '"';
        ausgabe.style.opacity = 1;
    }, 300);
};
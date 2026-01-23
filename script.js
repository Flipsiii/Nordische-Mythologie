/**
 * script.js
 * Firebase (Gästebuch), Runen-Übersetzer & Hávamál-Orakel
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    console.log("Skript erfolgreich als Modul geladen!");

    // ==========================================
    // TEIL A: HAVAMAL ORAKEL
    // ==========================================
    const havamalBtn = document.getElementById('havamalBtn');
    const havamalAusgabe = document.getElementById('havamalAusgabe');
    
    if (havamalBtn && havamalAusgabe) {
        const sprueche = [
            "Ein Brand entbrennt am anderen, bis er verbrannt ist; der Mensch wird durch den Menschen klug.",
            "Besser ist keine Last, die man nach Hause trägt, als viel Menschenverstand.",
            "Der Unweise, wenn er zum Volke kommt, so schweigt er am besten still.",
            "Den Weg zum Freunde, sei er auch weit, geh oft und pflege ihn.",
            "Vieh stirbt, Freunde sterben, endlich stirbt man selbst; doch eines weiß ich, das niemals stirbt: Das Urteil über den Toten.",
            "Ein eigener Herd ist Goldes wert, und wär's nur 'ne Hütte klein.",
            "Mäßig klug sei jedermann, nicht allzu klug.",
            "Früh aufstehen muss, wer eines anderen Gut oder Leben will.",
            "Gabe will Gegen-Gabe; ein Lächeln für ein Lächeln.",
            "Keiner ist so gut, dass er keinen Fehler hätte, und keiner so schlecht, dass er zu nichts nütze wäre."
        ];

        havamalBtn.addEventListener('click', () => {
            const zufall = Math.floor(Math.random() * sprueche.length);
            
            havamalAusgabe.style.opacity = "0";
            setTimeout(() => {
                havamalAusgabe.innerText = '"' + sprueche[zufall] + '"';
                havamalAusgabe.style.opacity = "1";
            }, 300);
        });
    }

    // ==========================================
    // TEIL B: RUNEN ÜBERSETZER
    // ==========================================
    const runenInput = document.getElementById('meinInput');
    const runenAusgabe = document.getElementById('runenAusgabe');

    if (runenInput && runenAusgabe) {
        const runenAlphabet = {
            'a': 'ᚨ', 'b': 'ᛒ', 'c': 'ᚲ', 'd': 'ᛞ', 'e': 'ᛖ', 'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚺ', 'i': 'ᛁ', 'j': 'ᛃ',
            'k': 'ᚲ', 'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᛟ', 'p': 'ᛈ', 'q': 'ᚲ', 'r': 'ᚱ', 's': 'ᛊ', 't': 'ᛏ',
            'u': 'ᚢ', 'v': 'ᚹ', 'w': 'ᚹ', 'x': 'ᛒ', 'y': 'ᛃ', 'z': 'ᛉ', ' ': ' ', 'ä': 'ᛇ', 'ö': 'ᛟ', 'ü': 'ᚢ'
        };

        runenInput.addEventListener('input', (e) => {
            const text = e.target.value.toLowerCase();
            let ergebnis = "";
            for (let char of text) {
                ergebnis += runenAlphabet[char] || char;
            }
            runenAusgabe.innerText = ergebnis || "...";
        });
    }

    // ==========================================
    // TEIL C: GÄSTEBUCH
    // ==========================================
    const submitBtn = document.getElementById('submitEntryBtn');
    const guestbookContainer = document.getElementById('guestbook-entries');

    if (submitBtn && guestbookContainer) {
  
        submitBtn.addEventListener('click', async () => {
            const nameInput = document.getElementById('guestName');
            const messageInput = document.getElementById('guestMessage');

            if (!nameInput.value || !messageInput.value) {
                alert("Die Götter verlangen einen Namen und eine Nachricht!");
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerText = "Wird gemeißelt...";

                await addDoc(collection(db, "gaestebuch"), {
                    name: nameInput.value,
                    message: messageInput.value,
                    timestamp: serverTimestamp(),
                    dateString: new Date().toLocaleDateString('de-DE') + ' um ' + new Date().toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
                });

                nameInput.value = "";
                messageInput.value = "";
                submitBtn.disabled = false;
                submitBtn.innerText = "In Stein meißeln";
            } catch (error) {
                console.error("Fehler beim Senden:", error);
                alert("Loki hat die Verbindung unterbrochen. Versuche es später erneut!");
                submitBtn.disabled = false;
                submitBtn.innerText = "In Stein meißeln";
            }
        });

        const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));
        onSnapshot(q, (snapshot) => {
            guestbookContainer.innerHTML = "";
            
            if (snapshot.empty) {
                guestbookContainer.innerHTML = "<p style='text-align:center; color:#ccc;'>Noch ist es ruhig in den Hallen...</p>";
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = 'entry';
                
                div.innerHTML = `
                    <div class="entry-header">
                        <span class="name">⚔️ ${data.name}</span>
                        <span class="date">${data.dateString || 'Gerade eben'}</span>
                    </div>
                    <div class="message">${data.message}</div>
                `;
                guestbookContainer.appendChild(div);
            });
        }, (error) => {
            console.error("Fehler beim Laden der Daten:", error);
        });
    }

});

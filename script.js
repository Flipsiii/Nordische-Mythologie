/**
 * script.js - Zentrale Steuerung für Flipsiii's Nordische Mythologie
 * Beinhaltet: Sidebar, Slideshow, Firebase-Auth, Gästebuch & Hávamál
 */

// ==========================================
// 1. IMPORTE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==========================================
// 2. KONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

// Reihenfolge für die Pfeil-Navigation (Slideshow)
// Hier wurden alle neuen Seiten eingefügt
const pageSequence = [
    "index.html", 
    "Wikinger.html", 
    "Yggdrasil.html", 
    "9Welten.html", // Übersicht
    // --- Die 9 Welten ---
    "Asgard.html", "Vanaheim.html", "Alfheim.html", 
    "Midgard.html", "Jotunheim.html", "Nidavellir.html", 
    "Muspelheim.html", "Niflheim.html", "Helheim.html",
    // --- Themen ---
    "Ragnarök.html", "Julfest.html", "Goetter.html", 
    // --- Götter ---
    "Odin.html", "OdinsRaben.html", "Sleipnir.html", // Sleipnir passt gut zu Odin
    "Frigg.html", "Thor.html", "Mjolnir.html", 
    "Loki.html", "Fenrir.html", "Jormungandr.html", "Hel.html", // Lokis Kinder
    "Freya.html", "Balder.html", "Freyr.html", "Heimdall.html", 
    "Tyr.html", "Idun.html", "Njoerd.html", "Skadi.html", 
    // --- Wesen ---
    "Riesen.html", "Nornen.html", "Walkueren.html"
];

// Weisheiten für das Orakel
const havamalQuotes = [
    "Der Unweise, wenn er zum Volke kommt, so schweigt er am besten still.",
    "Besser ist eine gute Gesinnung als viel Geld.",
    "Ein Gast soll gehen, nicht ewig bleiben am selben Ort.",
    "Kein besseres Bündel trägt man auf dem Wege als vieles Wissen.",
    "Das Feuer ist das Beste für die Söhne der Männer, und der Sonne Anblick.",
    "Gastfreundschaft ist dem Wanderer willkommen, der mit kalten Knien ankommt.",
    "Teile dein Brot mit dem Hungrigen; was du gibst, kommt zu dir zurück."
];

// Globale Variablen für Firebase Services
let db;
let auth;
let currentUser = null;

// ==========================================
// 3. FUNKTION: SIDEBAR RENDERN
// ==========================================
function renderSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // Aktuellen Dateinamen ermitteln
    const path = window.location.pathname;
    let page = path.substring(path.lastIndexOf('/') + 1) || "index.html";
    if (page === "/") page = "index.html";
    page = decodeURIComponent(page);

    container.innerHTML = `
        <nav class="sidebar">
            <h3>Menü</h3>
            <a href="index.html" class="${page === 'index.html' ? 'active' : ''}">Startseite</a>

            <details ${['Wikinger.html', 'Yggdrasil.html', '9Welten.html', 'Ragnarök.html', 'Julfest.html', 'YggdrasilKarte.html'].includes(page) ? 'open' : ''}>
                <summary>Mythologie & Infos ▾</summary>
                <a href="Wikinger.html" class="${page === 'Wikinger.html' ? 'active' : ''}">Die Wikinger</a>
                <a href="Yggdrasil.html" class="${page === 'Yggdrasil.html' ? 'active' : ''}">Yggdrasil</a>
                <a href="9Welten.html" class="${page === '9Welten.html' ? 'active' : ''}">Die 9 Welten (Übersicht)</a>
                <a href="Ragnarök.html" class="${page === 'Ragnarök.html' ? 'active' : ''}">Ragnarök</a>
                <a href="Julfest.html" class="${page === 'Julfest.html' ? 'active' : ''}">Das Julfest</a>
            </details>

            <details ${['Asgard.html', 'Midgard.html', 'Vanaheim.html', 'Jotunheim.html', 'Alfheim.html', 'Nidavellir.html', 'Muspelheim.html', 'Niflheim.html', 'Helheim.html'].includes(page) ? 'open' : ''}>
                <summary>Die Welten ▾</summary>
                <a href="Asgard.html" class="${page === 'Asgard.html' ? 'active' : ''}">Asgard (Asen)</a>
                <a href="Midgard.html" class="${page === 'Midgard.html' ? 'active' : ''}">Midgard (Menschen)</a>
                <a href="Vanaheim.html" class="${page === 'Vanaheim.html' ? 'active' : ''}">Vanaheim (Wanen)</a>
                <a href="Alfheim.html" class="${page === 'Alfheim.html' ? 'active' : ''}">Alfheim (Lichtalben)</a>
                <a href="Jotunheim.html" class="${page === 'Jotunheim.html' ? 'active' : ''}">Jötunheim (Riesen)</a>
                <a href="Nidavellir.html" class="${page === 'Nidavellir.html' ? 'active' : ''}">Nidavellir (Zwerge)</a>
                <a href="Muspelheim.html" class="${page === 'Muspelheim.html' ? 'active' : ''}">Muspelheim (Feuer)</a>
                <a href="Niflheim.html" class="${page === 'Niflheim.html' ? 'active' : ''}">Niflheim (Eis)</a>
                <a href="Helheim.html" class="${page === 'Helheim.html' ? 'active' : ''}">Helheim (Totenreich)</a>
            </details>

            <details ${['Goetter.html', 'Odin.html', 'OdinsRaben.html', 'Sleipnir.html', 'Frigg.html', 'Thor.html', 'Mjolnir.html', 'Loki.html', 'Freya.html', 'Balder.html', 'Freyr.html', 'Heimdall.html', 'Tyr.html', 'Idun.html', 'Njoerd.html', 'Skadi.html'].includes(page) ? 'open' : ''}>
                <summary>Die Götter ▾</summary>
                <a href="Goetter.html" class="${page === 'Goetter.html' ? 'active' : ''}">Übersicht</a>
                <a href="Odin.html" class="${page === 'Odin.html' ? 'active' : ''}">Odin</a>
                <a href="Thor.html" class="${page === 'Thor.html' ? 'active' : ''}">Thor</a>
                <a href="Loki.html" class="${page === 'Loki.html' ? 'active' : ''}">Loki</a>
                <a href="Freya.html" class="${page === 'Freya.html' ? 'active' : ''}">Freya</a>
                <a href="Frigg.html" class="${page === 'Frigg.html' ? 'active' : ''}">Frigg</a>
                <a href="Heimdall.html" class="${page === 'Heimdall.html' ? 'active' : ''}">Heimdall</a>
                <a href="Tyr.html" class="${page === 'Tyr.html' ? 'active' : ''}">Tyr</a>
                <a href="Balder.html" class="${page === 'Balder.html' ? 'active' : ''}">Balder</a>
                <a href="Freyr.html" class="${page === 'Freyr.html' ? 'active' : ''}">Freyr</a>
                <a href="Idun.html" class="${page === 'Idun.html' ? 'active' : ''}">Idun</a>
                <a href="Njoerd.html" class="${page === 'Njoerd.html' ? 'active' : ''}">Njörd</a>
                <a href="Skadi.html" class="${page === 'Skadi.html' ? 'active' : ''}">Skadi</a>
            </details>

            <details ${['Riesen.html', 'Fenrir.html', 'Jormungandr.html', 'Sleipnir.html', 'Nornen.html', 'Walkueren.html', 'Hel.html', 'OdinsRaben.html', 'Mjolnir.html'].includes(page) ? 'open' : ''}>
                <summary>Wesen & Mächte ▾</summary>
                <a href="Riesen.html" class="${page === 'Riesen.html' ? 'active' : ''}">Die Riesen (Jötnar)</a>
                <a href="Fenrir.html" class="${page === 'Fenrir.html' ? 'active' : ''}">Fenrir</a>
                <a href="Jormungandr.html" class="${page === 'Jormungandr.html' ? 'active' : ''}">Midgardschlange</a>
                <a href="Sleipnir.html" class="${page === 'Sleipnir.html' ? 'active' : ''}">Sleipnir</a>
                <a href="Hel.html" class="${page === 'Hel.html' ? 'active' : ''}">Göttin Hel</a>
                <a href="OdinsRaben.html" class="${page === 'OdinsRaben.html' ? 'active' : ''}">Odins Raben</a>
                <a href="Walkueren.html" class="${page === 'Walkueren.html' ? 'active' : ''}">Die Walküren</a>
                <a href="Nornen.html" class="${page === 'Nornen.html' ? 'active' : ''}">Die Nornen</a>
                <a href="Mjolnir.html" class="${page === 'Mjolnir.html' ? 'active' : ''}">Mjölnir</a>
            </details>
            
            <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                <a href="RunenUebersetzer.html" class="${page === 'RunenUebersetzer.html' ? 'active' : ''} guestbook-link">ᚱᚢᚾᛖᚾ Übersetzer</a>
                <a href="Gaestebuch.html" class="${page === 'Gaestebuch.html' ? 'active' : ''} guestbook-link">📖 Gästebuch</a>
                <a href="https://soundcloud.com/t-staude" target="_blank" class="soundcloud-btn" style="margin-top:10px;">Musik 🎵</a>
            </div>
        </nav>
    `;
}

// ==========================================
// 4. FUNKTION: SLIDESHOW RENDERN
// ==========================================
function renderSlideshow() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;

    const path = window.location.pathname;
    let page = path.substring(path.lastIndexOf('/') + 1) || "index.html";
    if (page === "/") page = "index.html";
    page = decodeURIComponent(page);

    const index = pageSequence.indexOf(page);
    if (index === -1) return;

    const prev = pageSequence[(index - 1 + pageSequence.length) % pageSequence.length];
    const next = pageSequence[(index + 1) % pageSequence.length];

    container.innerHTML = `
        <a href="${prev}" class="nav-arrow nav-arrow-left" title="Zurück">❮</a>
        <a href="${next}" class="nav-arrow nav-arrow-right" title="Weiter">❯</a>
    `;
}

// ==========================================
// 5. FUNKTION: HÁVAMÁL ORAKEL
// ==========================================
function initHavamal() {
    const btn = document.getElementById('havamalBtn');
    const display = document.getElementById('havamalAusgabe');
    if (!btn || !display) return;

    btn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * havamalQuotes.length);
        display.style.opacity = 0;
        setTimeout(() => {
            display.innerText = `"${havamalQuotes[randomIndex]}"`;
            display.style.opacity = 1;
        }, 200);
    });
}

// ==========================================
// 6. FUNKTION: RUNEN ÜBERSETZER
// ==========================================
function initRunes() {
    const input = document.getElementById('meinInput');
    const output = document.getElementById('runenAusgabe');
    if (!input || !output) return;

    const alphabet = {'a':'ᚨ','b':'ᛒ','c':'ᚲ','d':'ᛞ','e':'ᛖ','f':'ᚠ','g':'ᚷ','h':'ᚺ','i':'ᛁ','j':'ᛃ','k':'ᚲ','l':'ᛚ','m':'ᛗ','n':'ᚾ','o':'ᛟ','p':'ᛈ','q':'ᚲ','r':'ᚱ','s':'ᛊ','t':'ᛏ','u':'ᚢ','v':'ᚹ','w':'ᚹ','x':'ᛒ','y':'ᛃ','z':'ᛉ',' ':' ','ä':'ᛇ','ö':'ᛟ','ü':'ᚢ'};
    input.addEventListener('input', (e) => {
        let text = "";
        for (let char of e.target.value.toLowerCase()) { text += alphabet[char] || char; }
        output.innerText = text || "...";
    });
}

// ==========================================
// 7. FIREBASE AUTH & GÄSTEBUCH
// ==========================================
async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        
        // Globale Variablen zuweisen
        auth = getAuth(app);
        db = getFirestore(app);

        // Anonyme Anmeldung
        await signInAnonymously(auth);
        
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                console.log("Valhalla erkannt: Authentifizierung erfolgreich.");
                // Nur starten, wenn wir auf der Gästebuch-Seite sind
                if (document.getElementById('guestbook-entries')) {
                    setupGuestbook(); 
                }
            }
        });
    } catch (error) {
        console.error("Loki hat die Leitung gekappt (Firebase Fehler):", error);
    }
}

function setupGuestbook() {
    // Wenn DB noch nicht da ist, abbrechen
    if (!db) return;

    const submitBtn = document.getElementById('submitEntryBtn');
    const entriesContainer = document.getElementById('guestbook-entries');
    
    if (!submitBtn || !entriesContainer || !currentUser) return;

    // EVENT LISTENER FÜR SENDEN
    submitBtn.onclick = async () => {
        const nameInput = document.getElementById('guestName');
        const messageInput = document.getElementById('guestMessage');
        
        if (!nameInput.value || !messageInput.value) {
            alert("Die Götter verlangen einen Namen und eine Nachricht!");
            return;
        }

        try {
            await addDoc(collection(db, "gaestebuch"), {
                name: nameInput.value,
                message: messageInput.value,
                timestamp: serverTimestamp(),
                dateString: new Date().toLocaleDateString('de-DE')
            });
            nameInput.value = "";
            messageInput.value = "";
        } catch (e) { 
            console.error("Fehler beim Meißeln:", e); 
            alert("Fehler beim Senden: Hast du die Firestore Regeln aktiviert?");
        }
    };

    // ECHTZEIT LISTENER LADEN
    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        entriesContainer.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `
                <div class="entry-header">
                    <span class="name">⚔️ ${data.name}</span>
                    <span style="font-size:0.8em; opacity:0.7;">${data.dateString || ''}</span>
                </div>
                <div class="message">${data.message}</div>
            `;
            entriesContainer.appendChild(div);
        });
    });
}

// ==========================================
// START (MAIN)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderSlideshow();
    initHavamal();
    initRunes();
    initFirebase();
});
/**
 * script.js - Zentrale Steuerung für Flipsiii's Nordische Mythologie
 * Beinhaltet: Sidebar, Slideshow, Firebase-Auth, Gästebuch & Hávamál
 */

// 1. FIREBASE MODULE IMPORTIEREN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 2. KONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

// Reihenfolge für die Pfeil-Navigation (Slideshow)
const pageSequence = [
    "index.html", "Wikinger.html", "Yggdrasil.html", "9Welten.html", 
    "Ragnarök.html", "Julfest.html", "Goetter.html", 
    "Odin.html", "OdinsRaben.html", "Frigg.html", "Thor.html", 
    "Mjolnir.html", "Loki.html", "Freya.html", "Balder.html", 
    "Freyr.html", "Heimdall.html", "Tyr.html", "Idun.html", 
    "Njoerd.html", "Skadi.html", "Nornen.html", "Walkueren.html", "Hel.html"
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

// Variablen für Firebase Services
let db, auth, currentUser = null;

// ==========================================
// 1. FUNKTION: SIDEBAR RENDERN
// ==========================================
function renderSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // Aktuellen Dateinamen ermitteln
    const path = window.location.pathname;
    let page = path.substring(path.lastIndexOf('/') + 1) || "index.html";
    if (page === "/") page = "index.html";
    // Fix für URL-kodierte Zeichen
    page = decodeURIComponent(page);

    container.innerHTML = `
        <nav class="sidebar">
            <h3>Menü</h3>
            <a href="index.html" class="${page === 'index.html' ? 'active' : ''}">Startseite</a>

            <details ${['Wikinger.html', 'Yggdrasil.html', '9Welten.html', 'Ragnarök.html', 'Julfest.html', 'YggdrasilKarte.html'].includes(page) ? 'open' : ''}>
                <summary>Mythologie & Welten ▾</summary>
                <a href="Wikinger.html" class="${page === 'Wikinger.html' ? 'active' : ''}">Die Wikinger</a>
                <a href="Yggdrasil.html" class="${page === 'Yggdrasil.html' ? 'active' : ''}">Yggdrasil</a>
                <a href="YggdrasilKarte.html" class="${page === 'YggdrasilKarte.html' ? 'active' : ''}">Yggdrasil Karte 🌳</a>
                <a href="9Welten.html" class="${page === '9Welten.html' ? 'active' : ''}">Die 9 Welten</a>
                <a href="Ragnarök.html" class="${page === 'Ragnarök.html' ? 'active' : ''}">Ragnarök</a>
                <a href="Julfest.html" class="${page === 'Julfest.html' ? 'active' : ''}">Das Julfest</a>
            </details>

            <details ${['Goetter.html', 'Odin.html', 'OdinsRaben.html', 'Frigg.html', 'Thor.html', 'Mjolnir.html', 'Loki.html', 'Freya.html', 'Balder.html', 'Freyr.html', 'Heimdall.html', 'Tyr.html', 'Idun.html', 'Njoerd.html', 'Skadi.html'].includes(page) ? 'open' : ''}>
                <summary>Die Götter ▾</summary>
                <a href="Goetter.html" class="${page === 'Goetter.html' ? 'active' : ''}">Übersicht</a>
                <a href="Odin.html" class="${page === 'Odin.html' ? 'active' : ''}">Odin</a>
                <a href="Thor.html" class="${page === 'Thor.html' ? 'active' : ''}">Thor</a>
                <a href="Freya.html" class="${page === 'Freya.html' ? 'active' : ''}">Freya</a>
                <a href="Loki.html" class="${page === 'Loki.html' ? 'active' : ''}">Loki</a>
                <a href="Frigg.html" class="${page === 'Frigg.html' ? 'active' : ''}">Frigg</a>
                <a href="Balder.html" class="${page === 'Balder.html' ? 'active' : ''}">Balder</a>
                <a href="Freyr.html" class="${page === 'Freyr.html' ? 'active' : ''}">Freyr</a>
                <a href="Heimdall.html" class="${page === 'Heimdall.html' ? 'active' : ''}">Heimdall</a>
                <a href="Tyr.html" class="${page === 'Tyr.html' ? 'active' : ''}">Tyr</a>
                <a href="Idun.html" class="${page === 'Idun.html' ? 'active' : ''}">Idun</a>
                <a href="Njoerd.html" class="${page === 'Njoerd.html' ? 'active' : ''}">Njörd</a>
                <a href="Skadi.html" class="${page === 'Skadi.html' ? 'active' : ''}">Skadi</a>
            </details>

            <details ${['Nornen.html', 'Walkueren.html', 'Hel.html', 'OdinsRaben.html', 'Mjolnir.html'].includes(page) ? 'open' : ''}>
                <summary>Wesen & Mächte ▾</summary>
                <a href="OdinsRaben.html" class="${page === 'OdinsRaben.html' ? 'active' : ''}">Odins Raben</a>
                <a href="Mjolnir.html" class="${page === 'Mjolnir.html' ? 'active' : ''}">Mjölnir</a>
                <a href="Nornen.html" class="${page === 'Nornen.html' ? 'active' : ''}">Die Nornen</a>
                <a href="Walkueren.html" class="${page === 'Walkueren.html' ? 'active' : ''}">Die Walküren</a>
                <a href="Hel.html" class="${page === 'Hel.html' ? 'active' : ''}">Hel (Unterwelt)</a>
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
// 2. FUNKTION: SLIDESHOW RENDERN
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
// 3. FUNKTION: HÁVAMÁL ORAKEL
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
// 4. FUNKTION: RUNEN ÜBERSETZER
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
// 5. FIREBASE AUTH & GÄSTEBUCH
// ==========================================
async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        await signInAnonymously(auth);
        
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                console.log("Valhalla erkannt: Authentifizierung erfolgreich.");
                setupGuestbook(); 
            }
        });
    } catch (error) {
        console.error("Loki hat die Leitung gekappt (Firebase Fehler):", error);
    }
}

function setupGuestbook() {
    const submitBtn = document.getElementById('submitEntryBtn');
    const entriesContainer = document.getElementById('guestbook-entries');
    if (!submitBtn || !entriesContainer || !currentUser) return;

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
        } catch (e) { console.error("Fehler beim Meißeln:", e); }
    };

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
                </div>
                <div class="message">${data.message}</div>
            `;
            entriesContainer.appendChild(div);
        });
    });
}

// START
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderSlideshow();
    initHavamal();
    initRunes();
    initFirebase();
});
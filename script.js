/**
 * script.js - Zentrale Steuerung für Flipsiiis Nordische Mythologie
 * Beinhaltet: Sidebar, Slideshow, Firebase-Auth & Gästebuch
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

const pageSequence = [
    "index.html", "Wikinger.html", "Yggdrasil.html", "9Welten.html", 
    "9Welten.html", "Ragnarök.html", "Julfest.html", "Goetter.html", 
    "Odin.html", "OdinsRaben.html", "Frigg.html", "Thor.html", 
    "Mjolnir.html", "Loki.html", "Freya.html", "Balder.html", 
    "Freyr.html", "Heimdall.html", "Tyr.html", "Idun.html", 
    "Njoerd.html", "Skadi.html", "Nornen.html", "Walkueren.html", "Hel.html"
];

// Variablen für Firebase Services
let db, auth, currentUser = null;

// ==========================================
// 1. FUNKTION: SIDEBAR RENDERN (SOFORT)
// ==========================================
function renderSidebar() {
    console.log("Versuche Sidebar zu rendern...");
    const container = document.getElementById('sidebar-container');
    if (!container) {
        console.error("Fehler: #sidebar-container nicht im HTML gefunden!");
        return;
    }

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || "index.html";

    container.innerHTML = `
        <nav class="sidebar">
            <h3>Menü</h3>
            <a href="index.html" class="${page === 'index.html' ? 'active' : ''}">Startseite</a>

            <details ${['Wikinger.html', 'Yggdrasil.html', 'YggdrasilKarte.html', '9Welten.html', 'Ragnarök.html', 'Julfest.html'].includes(page) ? 'open' : ''}>
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
                <a href="Odin.html" class="${page === 'Odin.html' ? 'active' : ''}">Odin (Allvater)</a>
                <a href="Thor.html" class="${page === 'Thor.html' ? 'active' : ''}">Thor</a>
                <a href="Freya.html" class="${page === 'Freya.html' ? 'active' : ''}">Freya</a>
                <a href="Loki.html" class="${page === 'Loki.html' ? 'active' : ''}">Loki</a>
            </details>
            
            <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                <a href="RunenUebersetzer.html" class="${page === 'RunenUebersetzer.html' ? 'active' : ''} guestbook-link">ᚱᚢᚾᛖᚾ Übersetzer</a>
                <a href="Gaestebuch.html" class="${page === 'Gaestebuch.html' ? 'active' : ''} guestbook-link">📖 Gästebuch</a>
                <a href="https://soundcloud.com/t-staude" target="_blank" class="soundcloud-btn">Themen Musik 🎵</a>
            </div>
        </nav>
    `;
    console.log("Sidebar erfolgreich eingefügt.");
}

// ==========================================
// 2. FUNKTION: SLIDESHOW RENDERN
// ==========================================
function renderSlideshow() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;

    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || "index.html";
    const index = pageSequence.indexOf(page);

    if (index === -1) return;

    const prev = pageSequence[(index - 1 + pageSequence.length) % pageSequence.length];
    const next = pageSequence[(index + 1) % pageSequence.length];

    container.innerHTML = `
        <a href="${prev}" class="nav-arrow nav-arrow-left">❮</a>
        <a href="${next}" class="nav-arrow nav-arrow-right">❯</a>
    `;
}

// ==========================================
// 3. FIREBASE INITIALISIERUNG & AUTH (RULE 3)
// ==========================================
async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Anonym anmelden (Wichtig für Firestore Zugriff)
        await signInAnonymously(auth);
        
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                console.log("Firebase Auth erfolgreich: UID", user.uid);
                setupGuestbook(); // Erst wenn User da ist, Gästebuch laden
            }
        });
    } catch (error) {
        console.error("Firebase konnte nicht geladen werden:", error);
    }
}

// ==========================================
// 4. GÄSTEBUCH LOGIK
// ==========================================
function setupGuestbook() {
    const submitBtn = document.getElementById('submitEntryBtn');
    const entriesContainer = document.getElementById('guestbook-entries');
    if (!submitBtn || !entriesContainer || !currentUser) return;

    submitBtn.onclick = async () => {
        const nameInput = document.getElementById('guestName');
        const messageInput = document.getElementById('guestMessage');
        
        if (!nameInput.value || !messageInput.value) return;

        try {
            await addDoc(collection(db, "gaestebuch"), {
                name: nameInput.value,
                message: messageInput.value,
                timestamp: serverTimestamp(),
                dateString: new Date().toLocaleString('de-DE')
            });
            nameInput.value = "";
            messageInput.value = "";
        } catch (e) { console.error(e); }
    };

    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        entriesContainer.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `<div class="entry-header"><span class="name">⚔️ ${data.name}</span></div><div class="message">${data.message}</div>`;
            entriesContainer.appendChild(div);
        });
    });
}

// ==========================================
// START DER SEITE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI sofort bauen
    renderSidebar();
    renderSlideshow();
    
    // 2. Firebase im Hintergrund laden
    initFirebase();
});
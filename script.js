/**
 * script.js - ONLINE VERSION (Master Edition)
 * Beinhaltet: Firebase, Sidebar (Sortiert + Auto-Update), Slideshow, Runen, Hávamál
 */

// ==========================================
// 1. IMPORTE (Firebase)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==========================================
// 2. KONFIGURATION & LISTEN
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCG7peemk2I1MiRLXrS0uEGSa0kY9MsZjQ",
  authDomain: "wikinger-gaestebuch.firebaseapp.com",
  projectId: "wikinger-gaestebuch",
  storageBucket: "wikinger-gaestebuch.firebasestorage.app",
  messagingSenderId: "890193877785",
  appId: "1:890193877785:web:d08c8e74d8a0aeaced0388"
};

// Deine manuelle, logische Sortierung
const manualSortOrder = [
    "index.html",
    // Mythologie
    "Wikinger.html", "Yggdrasil.html", "Ragnarök.html", "Julfest.html",
    // Welten
    "9Welten.html", "Asgard.html", "Midgard.html", "Jotunheim.html", "Vanaheim.html", 
    "Helheim.html", "Nidavellir.html", "Alfheim.html", "Muspelheim.html", "Niflheim.html",
    // Götter
    "Goetter.html", "Odin.html", "Thor.html", "Loki.html", "Freya.html", "Frigg.html", 
    "Balder.html", "Freyr.html", "Heimdall.html", "Tyr.html", "Idun.html", "Njoerd.html", 
    "Skadi.html", "Hel.html", "Nornen.html",
    // Wesen & Mächte
    "OdinsRaben.html", "Mjolnir.html", "Walkueren.html", "Riesen.html", "Fenrir.html", 
    "Jormungandr.html", "Sleipnir.html",
    // Neue Seiten (manuell hinzugefügt)
    "die_einherjer.html", "bifroest_die_regenbogenbruecke.html", "draupnir.html",
    "ratatoeskr.html", "nidhoegg.html", "gungnir.html", "skidbladnir.html",
    "gleipnir.html", "hlidskjalf.html", "blutadler__rituale.html", "garm.html",
    "berserker.html", "der_brunnen_von_mimir.html", "naglfar.html",
    // Tools
    "RunenUebersetzer.html", "Gaestebuch.html"
];

// Diese Liste wird zur Laufzeit gefüllt (Manuell + Agenten-Seiten)
let dynamicPageSequence = [...manualSortOrder];

const havamalQuotes = [
    "Der Unweise, wenn er zum Volke kommt, so schweigt er am besten still.",
    "Besser ist eine gute Gesinnung als viel Geld.",
    "Ein Gast soll gehen, nicht ewig bleiben am selben Ort.",
    "Kein besseres Bündel trägt man auf dem Wege als vieles Wissen.",
    "Das Feuer ist das Beste für die Söhne der Männer, und der Sonne Anblick.",
    "Gastfreundschaft ist dem Wanderer willkommen, der mit kalten Knien ankommt.",
    "Teile dein Brot mit dem Hungrigen; was du gibst, kommt zu dir zurück.",
    "Mittelweise soll jeder Mensch sein, niemals allzu weise.",
    "Der unweise Mann wacht alle Nächte und sorgt um jede Sache.",
    "Besser ein Haus, und sei es noch so klein, als fremder Leute Bettler zu sein."
];

let db;
let auth;
let currentUser = null;

// ==========================================
// 3. INITIALISIERUNG
// ==========================================
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    let extraSeiten = [];
    
    // 1. Versuch: Seiten vom Agenten laden (seiten.json)
    try {
        const response = await fetch('seiten.json');
        if (response.ok) {
            const seitenVomAgent = await response.json();
            
            // Wir filtern: Nur Seiten, die NICHT schon in unserer manuellen Liste sind
            extraSeiten = seitenVomAgent.filter(s => !manualSortOrder.includes(s.url));
            
            // Wir erweitern die Playlist für die Pfeile
            const extraUrls = extraSeiten.map(s => s.url);
            dynamicPageSequence = [...manualSortOrder, ...extraUrls];

            if (extraSeiten.length > 0) {
                 showToast(`✨ ${extraSeiten.length} neue Saga(s) entdeckt!`);
            }
        }
    } catch (e) {
        console.log("Offline-Modus oder JSON nicht verfügbar. Nutze Standard.");
    }

    // 2. UI Rendern
    renderSidebar(extraSeiten); // Wir übergeben nur die wirklich neuen Seiten
    renderSlideshow();
    initHavamal();
    initRunes();
    initFirebase(); // Startet Datenbank
}

// ==========================================
// 4. SIDEBAR RENDERN (SOTIERT)
// ==========================================
function renderSidebar(neueSeitenVomAgent = []) {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    let page = window.location.pathname.split("/").pop() || "index.html";
    page = decodeURIComponent(page);

    container.innerHTML = `
        <nav class="sidebar">
            <h3>Menü</h3>
            <a href="index.html" class="${page === 'index.html' ? 'active' : ''}">Startseite</a>

            <details ${['Wikinger.html', 'Yggdrasil.html', 'Ragnarök.html', 'Julfest.html'].includes(page) ? 'open' : ''}>
                <summary>Mythologie & Infos ▾</summary>
                <a href="Wikinger.html" class="${page === 'Wikinger.html' ? 'active' : ''}">Die Wikinger</a>
                <a href="Yggdrasil.html" class="${page === 'Yggdrasil.html' ? 'active' : ''}">Yggdrasil</a>
                <a href="Ragnarök.html" class="${page === 'Ragnarök.html' ? 'active' : ''}">Ragnarök</a>
                <a href="Julfest.html" class="${page === 'Julfest.html' ? 'active' : ''}">Das Julfest</a>
            </details>
            
            <details ${['9Welten.html', 'Asgard.html', 'Midgard.html', 'Jotunheim.html', 'Vanaheim.html', 'Helheim.html', 'Nidavellir.html', 'Alfheim.html', 'Muspelheim.html', 'Niflheim.html'].includes(page) ? 'open' : ''}>
                <summary>Die Welten ▾</summary>
                <a href="9Welten.html" class="${page === '9Welten.html' ? 'active' : ''}">Die 9 Welten</a>
                <a href="Asgard.html" class="${page === 'Asgard.html' ? 'active' : ''}">Asgard</a>
                <a href="Midgard.html" class="${page === 'Midgard.html' ? 'active' : ''}">Midgard</a>
                <a href="Jotunheim.html" class="${page === 'Jotunheim.html' ? 'active' : ''}">Jötunheim</a>
                <a href="Vanaheim.html" class="${page === 'Vanaheim.html' ? 'active' : ''}">Vanaheim</a>
                <a href="Helheim.html" class="${page === 'Helheim.html' ? 'active' : ''}">Helheim</a>
                <a href="Nidavellir.html" class="${page === 'Nidavellir.html' ? 'active' : ''}">Nidavellir</a>
                <a href="Alfheim.html" class="${page === 'Alfheim.html' ? 'active' : ''}">Alfheim</a>
                <a href="Muspelheim.html" class="${page === 'Muspelheim.html' ? 'active' : ''}">Muspelheim</a>
                <a href="Niflheim.html" class="${page === 'Niflheim.html' ? 'active' : ''}">Niflheim</a>
            </details>

            <details ${['Goetter.html', 'Odin.html', 'Thor.html', 'Loki.html', 'Freya.html', 'Frigg.html', 'Balder.html', 'Freyr.html', 'Heimdall.html', 'Tyr.html', 'Idun.html', 'Njoerd.html', 'Skadi.html', 'Hel.html', 'Nornen.html'].includes(page) ? 'open' : ''}>
                <summary>Die Götter ▾</summary>
                <a href="Goetter.html" class="${page === 'Goetter.html' ? 'active' : ''}">Übersicht</a>
                <a href="Odin.html" class="${page === 'Odin.html' ? 'active' : ''}">Odin</a>
                <a href="Thor.html" class="${page === 'Thor.html' ? 'active' : ''}">Thor</a>
                <a href="Loki.html" class="${page === 'Loki.html' ? 'active' : ''}">Loki</a>
                <a href="Freya.html" class="${page === 'Freya.html' ? 'active' : ''}">Freya</a>
                <a href="Frigg.html" class="${page === 'Frigg.html' ? 'active' : ''}">Frigg</a>
                <a href="Balder.html" class="${page === 'Balder.html' ? 'active' : ''}">Balder</a>
                <a href="Freyr.html" class="${page === 'Freyr.html' ? 'active' : ''}">Freyr</a>
                <a href="Heimdall.html" class="${page === 'Heimdall.html' ? 'active' : ''}">Heimdall</a>
                <a href="Tyr.html" class="${page === 'Tyr.html' ? 'active' : ''}">Tyr</a>
                <a href="Idun.html" class="${page === 'Idun.html' ? 'active' : ''}">Idun</a>
                <a href="Njoerd.html" class="${page === 'Njoerd.html' ? 'active' : ''}">Njörd</a>
                <a href="Skadi.html" class="${page === 'Skadi.html' ? 'active' : ''}">Skadi</a>
                <a href="Hel.html" class="${page === 'Hel.html' ? 'active' : ''}">Hel</a>
                <a href="Nornen.html" class="${page === 'Nornen.html' ? 'active' : ''}">Nornen</a>
            </details>

            <details ${['Riesen.html', 'Fenrir.html', 'Jormungandr.html', 'Sleipnir.html', 'OdinsRaben.html', 'Mjolnir.html', 'Walkueren.html'].includes(page) ? 'open' : ''}>
                <summary>Wesen & Mächte ▾</summary>
                <a href="OdinsRaben.html" class="${page === 'OdinsRaben.html' ? 'active' : ''}">Odins Raben</a>
                <a href="Mjolnir.html" class="${page === 'Mjolnir.html' ? 'active' : ''}">Mjölnir</a>
                <a href="Walkueren.html" class="${page === 'Walkueren.html' ? 'active' : ''}">Walküren</a>
                <a href="Riesen.html" class="${page === 'Riesen.html' ? 'active' : ''}">Die Riesen</a>
                <a href="Fenrir.html" class="${page === 'Fenrir.html' ? 'active' : ''}">Fenrir</a>
                <a href="Jormungandr.html" class="${page === 'Jormungandr.html' ? 'active' : ''}">Jörmungandr</a>
                <a href="Sleipnir.html" class="${page === 'Sleipnir.html' ? 'active' : ''}">Sleipnir</a>
            </details>

            <details ${['die_einherjer.html', 'bifroest_die_regenbogenbruecke.html', 'draupnir.html', 'ratatoeskr.html', 'nidhoegg.html', 'gungnir.html', 'skidbladnir.html', 'gleipnir.html', 'hlidskjalf.html', 'blutadler__rituale.html', 'garm.html', 'berserker.html', 'der_brunnen_von_mimir.html', 'naglfar.html'].includes(page) ? 'open' : ''}>
                <summary>Weitere Sagen ▾</summary>
                <a href="die_einherjer.html" class="${page === 'die_einherjer.html' ? 'active' : ''}">Die Einherjer</a>
                <a href="bifroest_die_regenbogenbruecke.html" class="${page === 'bifroest_die_regenbogenbruecke.html' ? 'active' : ''}">Bifröst</a>
                <a href="draupnir.html" class="${page === 'draupnir.html' ? 'active' : ''}">Draupnir</a>
                <a href="ratatoeskr.html" class="${page === 'ratatoeskr.html' ? 'active' : ''}">Ratatöskr</a>
                <a href="nidhoegg.html" class="${page === 'nidhoegg.html' ? 'active' : ''}">Nidhögg</a>
                <a href="gungnir.html" class="${page === 'gungnir.html' ? 'active' : ''}">Gungnir</a>
                <a href="skidbladnir.html" class="${page === 'skidbladnir.html' ? 'active' : ''}">Skidbladnir</a>
                <a href="gleipnir.html" class="${page === 'gleipnir.html' ? 'active' : ''}">Gleipnir</a>
                <a href="hlidskjalf.html" class="${page === 'hlidskjalf.html' ? 'active' : ''}">Hlidskjalf</a>
                <a href="blutadler__rituale.html" class="${page === 'blutadler__rituale.html' ? 'active' : ''}">Blutadler & Rituale</a>
                <a href="garm.html" class="${page === 'garm.html' ? 'active' : ''}">Garm</a>
                <a href="berserker.html" class="${page === 'berserker.html' ? 'active' : ''}">Berserker</a>
                <a href="der_brunnen_von_mimir.html" class="${page === 'der_brunnen_von_mimir.html' ? 'active' : ''}">Mimirs Brunnen</a>
                <a href="naglfar.html" class="${page === 'naglfar.html' ? 'active' : ''}">Naglfar</a>
            </details>

            ${neueSeitenVomAgent.length > 0 ? `
            <details open>
                <summary style="color: #ffd700;">Neu entdeckt ▾</summary>
                ${neueSeitenVomAgent.map(s => `<a href="${s.url}" class="${page === s.url ? 'active' : ''}">✨ ${s.titel}</a>`).join('')}
            </details>
            ` : ''}
            
            <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                <a href="RunenUebersetzer.html" class="${page === 'RunenUebersetzer.html' ? 'active' : ''} guestbook-link">ᚱᚢᚾᛖᚾ Übersetzer</a>
                <a href="Gaestebuch.html" class="${page === 'Gaestebuch.html' ? 'active' : ''} guestbook-link">📖 Gästebuch</a>
                <a href="https://soundcloud.com/t-staude" target="_blank" class="soundcloud-btn" style="margin-top:10px;">Musik 🎵</a>
            </div>
        </nav>`;
}

// ==========================================
// 5. SLIDESHOW
// ==========================================
function renderSlideshow() {
    const container = document.getElementById('slideshow-container');
    if (!container) return;
    
    let page = window.location.pathname.split("/").pop() || "index.html";
    page = decodeURIComponent(page);

    const index = dynamicPageSequence.indexOf(page);
    if (index === -1) return;

    const prev = dynamicPageSequence[(index - 1 + dynamicPageSequence.length) % dynamicPageSequence.length];
    const next = dynamicPageSequence[(index + 1) % dynamicPageSequence.length];

    container.innerHTML = `<a href="${prev}" class="nav-arrow nav-arrow-left">❮</a><a href="${next}" class="nav-arrow nav-arrow-right">❯</a>`;
}

// ==========================================
// 6. TOOLS (Runen & Havamal)
// ==========================================
function initHavamal() {
    const btn = document.getElementById('havamalBtn');
    const display = document.getElementById('havamalAusgabe');
    if (btn && display) {
        btn.addEventListener('click', () => {
            display.style.opacity = 0;
            setTimeout(() => {
                display.innerText = `"${havamalQuotes[Math.floor(Math.random() * havamalQuotes.length)]}"`;
                display.style.opacity = 1;
            }, 200);
        });
    }
}

function initRunes() {
    const input = document.getElementById('meinInput');
    const output = document.getElementById('runenAusgabe');
    if (input && output) {
        const runes = {'a':'ᚨ','b':'ᛒ','c':'ᚲ','d':'ᛞ','e':'ᛖ','f':'ᚠ','g':'ᚷ','h':'ᚺ','i':'ᛁ','j':'ᛃ','k':'ᚲ','l':'ᛚ','m':'ᛗ','n':'ᚾ','o':'ᛟ','p':'ᛈ','q':'ᚲ','r':'ᚱ','s':'ᛊ','t':'ᛏ','u':'ᚢ','v':'ᚹ','w':'ᚹ','x':'ᛒ','y':'ᛃ','z':'ᛉ',' ':' ','ä':'ᛇ','ö':'ᛟ','ü':'ᚢ'};
        input.addEventListener('input', (e) => {
            output.innerText = e.target.value.toLowerCase().split('').map(c => runes[c] || c).join('') || "...";
        });
    }
}

// ==========================================
// 7. FIREBASE & GÄSTEBUCH
// ==========================================
async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        await signInAnonymously(auth);
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user && document.getElementById('guestbook-entries')) {
                setupGuestbook(); 
            }
        });
    } catch (error) { console.error("Firebase Fehler:", error); }
}

function setupGuestbook() {
    if (!db) return;
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
                dateString: new Date().toLocaleDateString('de-DE')
            });
            nameInput.value = ""; messageInput.value = "";
        } catch (e) { console.error(e); }
    };

    const q = query(collection(db, "gaestebuch"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        entriesContainer.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `<div class="entry-header"><span class="name">⚔️ ${data.name}</span> <span style="font-size:0.8em; opacity:0.7;">${data.dateString || ''}</span></div><div class="message">${data.message}</div>`;
            entriesContainer.appendChild(div);
        });
    });
}

// Toast Notification für neue Seiten
function showToast(msg) {
    let x = document.getElementById("toast");
    if (!x) {
        x = document.createElement("div");
        x.id = "toast";
        document.body.appendChild(x);
    }
    x.innerText = msg;
    x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}
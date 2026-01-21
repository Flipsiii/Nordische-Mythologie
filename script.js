// Runenalaphet 
const runenAlphabet = {
    'a': 'ᚨ', 'b': 'ᛒ', 'c': 'ᚲ', 'd': 'ᛞ', 'e': 'ᛖ',
    'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚺ', 'i': 'ᛁ', 'j': 'ᛃ',
    'k': 'ᚲ', 'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᛟ',
    'p': 'ᛈ', 'q': 'ᚲ', 'r': 'ᚱ', 's': 'ᛊ', 't': 'ᛏ',
    'u': 'ᚢ', 'v': 'ᚹ', 'w': 'ᚹ', 'x': 'ᛒ', 'y': 'ᛃ',
    'z': 'ᛉ', ' ': ' ', 
    'ä': 'ᛇ', 'ö': 'ᛟ', 'ü': 'ᚢ'
};

function uebersetzeInRunen() {
    // 1. Den Text aus dem Eingabefeld holen
    const eingabeFeld = document.getElementById('meinInput');
    const text = eingabeFeld.value.toLowerCase(); // Alles in Kleinbuchstaben umwandeln

    // 2. Den Text Buchstabe für Buchstabe übersetzen
    let ergebnis = "";
    
    for (let i = 0; i < text.length; i++) {
        const buchstabe = text[i];
        
        // Prüfen, ob wir eine Rune für diesen Buchstaben haben
        if (runenAlphabet[buchstabe]) {
            ergebnis += runenAlphabet[buchstabe];
        } else {
            // Falls nicht (z.B. Zahlen oder !?), behalten wir das Originalzeichen
            ergebnis += buchstabe;
        }
    }

    // 3. Das Ergebnis auf der Seite anzeigen
    const ausgabeFeld = document.getElementById('runenAusgabe');
    ausgabeFeld.innerText = ergebnis;
}
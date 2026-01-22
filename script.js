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
 
    const eingabeFeld = document.getElementById('meinInput');
    const text = eingabeFeld.value.toLowerCase();

    let ergebnis = "";
    
    for (let i = 0; i < text.length; i++) {
        const buchstabe = text[i];
        
        if (runenAlphabet[buchstabe]) {
            ergebnis += runenAlphabet[buchstabe];
        } else {
            ergebnis += buchstabe;
        }
    }
	
    const ausgabeFeld = document.getElementById('runenAusgabe');
    ausgabeFeld.innerText = ergebnis;
}
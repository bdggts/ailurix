const fs = require('fs');
const content = fs.readFileSync('public/game/game.js', 'utf8');
let p = 0, b = 0, inS = null, inC = null;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let c = line[j], n = line[j+1];
        if (inC === '//') { break; }
        else if (inC === '/*') { if (c === '*' && n === '/') { inC = null; j++; } }
        else if (inS) { if (c === '\\') j++; else if (c === inS) inS = null; }
        else {
            if (c === '/' && n === '/') { inC = '//'; break; }
            else if (c === '/' && n === '*') { inC = '/*'; j++; }
            else if (c === "'" || c === '"' || c === "`") inS = c;
            else if (c === '(') p++; else if (c === ')') p--;
            else if (c === '{') b++; else if (c === '}') b--;
        }
    }
    // Check if we are at top-level inside IIFE
    if (i > 2 && i < 1780) {
        if (p !== 1) { console.log(`LINE ${i+1} UNBALANCED: P=${p} B=${b}`); process.exit(0); }
    }
}

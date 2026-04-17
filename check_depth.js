const fs = require('fs');

function findImbalance(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    let pDepth = 0;
    let bDepth = 0;
    let inString = null;
    let inComment = null;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let lineStr = lines[i];
        for (let j = 0; j < lineStr.length; j++) {
            let char = lineStr[j];
            let next = lineStr[j+1];
            
            if (inComment === '//') {
                // reset at newline
            } else if (inComment === '/*') {
                if (char === '*' && next === '/') { inComment = null; j++; }
            } else if (inString) {
                if (char === '\\') { j++; }
                else if (char === inString) inString = null;
            } else {
                if (char === '/' && next === '/') { inComment = '//'; break; }
                else if (char === '/' && next === '*') { inComment = '/*'; j++; }
                else if (char === "'" || char === '"' || char === "`") inString = char;
                else if (char === '(') pDepth++;
                else if (char === ')') pDepth--;
                else if (char === '{') bDepth++;
                else if (char === '}') bDepth--;
            }
        }
        if (inComment === '//') inComment = null;
        
        // Expected inside IIFE: pDepth=1, bDepth=1 (global IIFE start)
        // If it's higher at the end of a line that SHOULD be top-level...
        console.log(`L${i+1}: P${pDepth} B${bDepth}`);
    }
}

findImbalance(process.argv[2]);

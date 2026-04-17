const fs = require('fs');

function checkBalance(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    let bDepth = 0;
    let pDepth = 0;
    let inString = null;
    let inComment = null;
    let i = 0;
    let line = 1;
    
    while (i < content.length) {
        let char = content[i];
        let next = content[i+1];
        
        if (inComment === '//') {
            if (char === '\n') { inComment = null; line++; }
        } else if (inComment === '/*') {
            if (char === '*' && next === '/') { inComment = null; i++; }
            else if (char === '\n') line++;
        } else if (inString) {
            if (char === '\\') i++; 
            else if (char === inString) inString = null;
            else if (char === '\n') line++;
        } else {
            if (char === '/' && next === '/') inComment = '//';
            else if (char === '/' && next === '*') { inComment = '/*'; i++; }
            else if (char === "'" || char === '"' || char === "`") inString = char;
            else if (char === '{') bDepth++;
            else if (char === '}') bDepth--;
            else if (char === '(') pDepth++;
            else if (char === ')') pDepth--;
            
            if (char === '\n') {
                line++;
                if (line % 100 === 0) console.log(`Line ${line}: bDepth ${bDepth}, pDepth ${pDepth}`);
            }
        }
        i++;
    }
}

checkBalance(process.argv[2]);

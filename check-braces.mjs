import fs from 'fs';
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');

let divOpen = 0;
let divClosing = 0;
let inStr = false;
let strChar = '';
let inComment = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let j = 0;
  
  while (j < line.length) {
    const c = line[j];
    
    if (inComment) {
      if (c === '*' && line[j+1] === '/') {
        inComment = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    if (inStr) {
      if (c === '\\' && strChar !== '`') {
        j += 2;
        continue;
      }
      if (c === strChar) {
        inStr = false;
      }
      j++;
      continue;
    }
    
    // Check for JSX comments
    if (c === '{' && line[j+1] === '/' && line[j+2] === '*') {
      inComment = true;
      j += 3;
      continue;
    }
    
    // Check for string start (only in JSX-like contexts, not in JS expressions)
    if (strChar === '' && (c === '"' || c === "'")) {
      inStr = true;
      strChar = c;
      j++;
      continue;
    }
    
    // Skip template literals (we'll approximate)
    if (c === '`' && strChar === '') {
      // Only count as simple check for the start
      // not going to do a full template literal parser here
      // Just skip to closing `
      inStr = true;
      strChar = '`';
      j++;
      continue;
    }
    
    j++;
  }
}

console.log('Done');

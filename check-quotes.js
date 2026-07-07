const fs = require('fs');
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  // Check for backtick strings that might be unclosed
  let inStr = false;
  let strChar = '';
  let prev = '';
  for (let c of lines[i]) {
    if (!inStr && (c === '"' || c === "'")) {
      inStr = true;
      strChar = c;
    } else if (inStr && c === strChar && prev !== '\\') {
      inStr = false;
    }
    prev = c;
  }
  if (inStr) {
    console.log('Unclosed quote line ' + (i+1) + ': ' + lines[i]);
  }
  
  // Check for template literals
  inStr = false;
  prev = '';
  for (let c of lines[i]) {
    if (!inStr && c === '`') {
      inStr = true;
    } else if (inStr && c === '`' && prev !== '\\') {
      inStr = false;
    }
    prev = c;
  }
  if (inStr) {
    console.log('Unclosed template line ' + (i+1) + ': ' + lines[i]);
  }
}

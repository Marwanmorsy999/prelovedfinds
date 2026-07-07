import fs from 'fs';
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');

const tags = [];
let inComment = false;
let inStr = false;
let strChar = '';
let inTemplate = false;
let templateDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let j = 0;
  
  while (j < line.length) {
    const c = line[j];
    const next = line[j+1] || '';
    const next2 = line[j+2] || '';
    
    if (inComment) {
      if (c === '*' && next === '/') {
        inComment = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    if (inStr) {
      if (c === '\\') {
        j += 2;
        continue;
      }
      if (c === strChar) {
        inStr = false;
      }
      j++;
      continue;
    }
    
    if (inTemplate) {
      if (c === '$' && next === '{') {
        templateDepth++;
        j += 2;
        continue;
      }
      if (c === '`') {
        if (templateDepth === 0) {
          inTemplate = false;
        } else {
          templateDepth--;
        }
      }
      j++;
      continue;
    }
    
    // JSX comment
    if (c === '{' && next === '/' && next2 === '*') {
      inComment = true;
      j += 3;
      continue;
    }
    
    // String literal
    if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      j++;
      continue;
    }
    
    // Template literal
    if (c === '`') {
      inTemplate = true;
      templateDepth = 0;
      j++;
      continue;
    }
    
    j++;
  }
}

console.log('Done parsing. Comment state:', inComment, 'Str state:', inStr, 'Template state:', inTemplate);

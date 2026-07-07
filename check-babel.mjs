import { parse } from '@babel/parser';
import fs from 'fs';

const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
try {
  parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
} catch(e) {
  console.error('Message:', e.message);
  console.error('Loc:', e.loc);
  
  // Show context around the error
  const lines = code.split('\n');
  const start = Math.max(0, e.loc.line - 5);
  const end = Math.min(lines.length, e.loc.line + 5);
  console.error('Context:');
  for (let i = start; i < end; i++) {
    console.error((i+1) + ': ' + lines[i]);
  }
}

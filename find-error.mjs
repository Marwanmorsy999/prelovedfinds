import { parse } from '@babel/parser';
import fs from 'fs';
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const chunk = lines.slice(0, i + 1).join('\n');
  try {
    parse(chunk, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  } catch (e) {
    if (e.loc && e.loc.line === i + 1) {
      console.log('First parse failure at line', i + 1);
      console.log('Context:', chunk.slice(Math.max(0, chunk.length - 500)));
      break;
    }
  }
}

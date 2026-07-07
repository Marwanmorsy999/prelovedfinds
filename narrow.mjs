import { parse } from '@babel/parser';
import fs from 'fs';
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');

// Try parsing with different prefixes to narrow down
for (let start = 1; start < lines.length; start += 100) {
  const chunk = 'const f = () => {\n' + lines.slice(1, start).join('\n') + '\nreturn (\n' + lines.slice(start).join('\n') + '\n);\n};';
  try {
    parse(chunk, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  } catch (e) {
    if (e.loc) {
      const actual = e.loc.line + start - 1;
      if (actual <= 1450) {
        console.log('Error at line', actual, 'col', e.loc.column, ':', e.message);
      }
    }
  }
}

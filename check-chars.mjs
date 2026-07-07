import fs from 'fs';
const code = fs.readFileSync('D:\\prelovedfinds\\src\\routes\\admin.tsx', 'utf8');
const lines = code.split('\n');
const target = lines[1444]; // line 1445
console.log('String:', JSON.stringify(target));
for (let i = 0; i < target.length; i++) {
  console.log(`  pos ${i}: 0x${target.charCodeAt(i).toString(16).toUpperCase().padStart(4,'0')} (${target[i]})`);
}
console.log('Length:', target.length);

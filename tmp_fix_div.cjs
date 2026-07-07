const fs = require('fs');
const lines = fs.readFileSync('src/routes/admin.tsx', 'utf8').split('\n');
lines[1185] = '                    <div';
fs.writeFileSync('src/routes/admin.tsx', lines.join('\n'));
console.log('fixed line 1186');

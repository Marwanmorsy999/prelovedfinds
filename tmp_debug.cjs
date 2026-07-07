const fs = require('fs');
const s = fs.readFileSync('src/routes/admin.tsx', 'utf8');
const lines = s.split('\n');
let depth = 0;
const stack = [];
lines.forEach((l, i) => {
  const isSelfClosing = /<div[^>]*\/>/.test(l);
  const o = (l.match(/<div/g) || []).length;
  const c = (l.match(/<\/div>/g) || []).length;
  if (isSelfClosing) {
    stack.push({ line: i + 1, self: true });
    stack.pop();
  } else {
    for (let k = 0; k < o; k++) {
      depth++;
      stack.push({ line: i + 1, self: false });
    }
  }
  let k = c;
  while (k-- > 0) {
    if (stack.length) stack.pop();
    depth--;
  }
});
console.log('Remaining at end:', stack.map(x => x.line));
console.log('Depth at end:', depth);

// Check depth at line 1223
let d2 = 0;
const s2 = [];
for (let i = 0; i < 1223; i++) {
  const l = lines[i];
  const isSelf = /<div[^>]*\/>/.test(l);
  const o = (l.match(/<div/g) || []).length;
  const c = (l.match(/<\/div>/g) || []).length;
  if (isSelf) {
    s2.push({ line: i + 1, self: true });
    s2.pop();
  } else {
    for (let k = 0; k < o; k++) {
      d2++;
      s2.push({ line: i + 1, self: false });
    }
  }
  let k = c;
  while (k-- > 0) {
    if (s2.length) s2.pop();
    d2--;
  }
}
console.log('Remaining at line 1223:', s2.map(x => x.line));
console.log('Depth at line 1223:', d2);

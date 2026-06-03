import fs from 'fs';
import path from 'path';

const file = path.resolve('lib', 'data.ts');
let content = fs.readFileSync(file, 'utf-8');

const replacements = [
  { bad: 'â€ ', good: '\\"' }, // escaped quote for JSON/JS strings!
  { bad: 'â€\x9D', good: '\\"' },
  { bad: 'â€\x9C', good: '\\"' },
  { bad: 'â€”', good: '-' },
  { bad: 'â€“', good: '-' },
  { bad: 'â‚¹', good: '₹' },
  { bad: 'Ã—', good: '×' },
  { bad: 'â€‹', good: '' },
  { bad: 'Â°', good: '°' },
];

for (const { bad, good } of replacements) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(file, content);
console.log('Fixed lib/data.ts mojibake safely');

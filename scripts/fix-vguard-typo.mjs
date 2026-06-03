import fs from 'fs';
import path from 'path';

const file = path.resolve('lib', 'data.ts');
let content = fs.readFileSync(file, 'utf-8');

// Fix the typo "V Guar" and standardize "V Guard" to "V-Guard"
content = content.replace(/"V Guar /g, '"V-Guard ');
content = content.replace(/"V Guard /g, '"V-Guard ');

fs.writeFileSync(file, content);
console.log('Fixed V-Guard spelling typos in data.ts');

const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app/api/admin/content/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("import pool from '@/lib/db';")) {
    content = content.replace("import pool from '@/lib/db';", "import { query } from '@/lib/db';");
    content = content.replace(/await pool\.query\(/g, "await query(");
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Reverted ${file}`);
  }
});

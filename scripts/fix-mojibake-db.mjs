import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Load env vars
const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

async function main() {
  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST || 'localhost',
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || '',
    database: env.MYSQL_DATABASE || 'avegatasta'
  });
  
  const updates = [
    { bad: 'â€ ', good: '"' },
    { bad: 'â€\x9D', good: '"' },
    { bad: 'â€\x9C', good: '"' },
    { bad: 'â€”', good: '-' },
    { bad: 'â€“', good: '-' },
    { bad: 'â‚¹', good: '₹' },
    { bad: 'Ã—', good: '×' },
    { bad: 'â€‹', good: '' },
    { bad: 'Â°', good: '°' },
  ];

  for (const { bad, good } of updates) {
    await connection.query(`UPDATE product_pricing SET product_id = REPLACE(product_id, ?, ?), description = REPLACE(description, ?, ?)`, [bad, good, bad, good]);
  }
  
  // also check if there are other tables like categories
  try {
    await connection.query("UPDATE categories SET name = REPLACE(name, 'â€ ', '\"')");
  } catch (e) {
    if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
  }
  
  console.log('Database mojibake fixed successfully');
  await connection.end();
}
main().catch(console.error);

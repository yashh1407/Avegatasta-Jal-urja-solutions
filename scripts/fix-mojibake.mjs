import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'avegatasta'
  });
  
  const [rows] = await connection.query("SELECT product_id, name FROM product_pricing WHERE name LIKE '%WBW3%'");
  console.log('Before:', rows);

  // Fix all mojibake for right double quote
  await connection.query("UPDATE product_pricing SET name = REPLACE(name, 'â€\x9D', '\"')");
  
  // What about left double quote?
  await connection.query("UPDATE product_pricing SET name = REPLACE(name, 'â€\x9C', '\"')");

  // What about en dash?
  await connection.query("UPDATE product_pricing SET name = REPLACE(name, 'â€“', '-')");
  
  const [rowsAfter] = await connection.query("SELECT product_id, name FROM product_pricing WHERE name LIKE '%WBW3%'");
  console.log('After:', rowsAfter);
  
  await connection.end();
}
main().catch(console.error);

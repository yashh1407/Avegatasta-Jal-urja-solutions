const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const mysql = require('mysql2/promise');

async function testInit() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const connection = await pool.getConnection();
  try {
    const [clients] = await connection.query('SELECT id, name FROM clients');
    console.log('Clients:', clients);
    const [inquiries] = await connection.query('SELECT id, name, client_id FROM inquiries');
    console.log('Inquiries:', inquiries);
    const [product_inquiries] = await connection.query('SELECT id, name, client_id FROM product_inquiries');
    console.log('Product Inquiries:', product_inquiries);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}
testInit();

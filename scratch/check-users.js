const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'avegatasta',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    const [rows] = await connection.query('SELECT id, name, email, role, permissions FROM admin_users');
    console.log('Admin Users:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();

const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'avegatasta',
  });
  try {
    const [rows] = await connection.execute('SELECT id, title, slug, status FROM pages');
    console.log('Pages in DB:', rows);
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();

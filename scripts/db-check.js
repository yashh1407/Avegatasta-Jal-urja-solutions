const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'avegatasta',
  });

  try {
    const [rows] = await connection.query(`
      SELECT id, page_id, section_type, section_key, title, data_json FROM page_sections WHERE section_type = 'FAQAccordion'
    `);
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
check();

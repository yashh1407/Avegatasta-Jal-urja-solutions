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
      SELECT p.id, p.title, p.slug, p.status, p.show_in_menu as in_menu,
             (SELECT COUNT(*) FROM page_sections s WHERE s.page_id = p.id) as section_count
      FROM pages p
      ORDER BY p.updated_at DESC
    `);
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
check();

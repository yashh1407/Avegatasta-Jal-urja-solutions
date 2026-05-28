const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testInit() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const connection = await pool.getConnection();
  try {
    for (const ddl of [
      `ALTER TABLE inquiries ADD COLUMN meeting_type ENUM('office', 'custom') NULL`,
      `ALTER TABLE inquiries ADD COLUMN meeting_location TEXT NULL`,
      `ALTER TABLE inquiries ADD COLUMN client_id INT DEFAULT NULL`,
    ]) {
      try {
        console.log('Running:', ddl);
        await connection.query(ddl);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      }
    }
    
    for (const ddl of [
      `ALTER TABLE product_inquiries ADD COLUMN meeting_time VARCHAR(20) NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_type ENUM('office', 'custom') NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN meeting_location TEXT NULL`,
      `ALTER TABLE product_inquiries ADD COLUMN client_id INT DEFAULT NULL`,
    ]) {
      try {
        console.log('Running:', ddl);
        await connection.query(ddl);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      }
    }
    console.log('Success');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}
testInit();

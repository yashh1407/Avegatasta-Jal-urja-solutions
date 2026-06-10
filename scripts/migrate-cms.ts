const mysql = require('mysql2/promise');

async function migrate() {
  console.log("Starting CMS database migration...");
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'avegatasta',
  });

  const query = async (sql, values) => {
    const [results] = await connection.execute(sql, values);
    return results;
  };

  try {
    // 1. Update pages table
    console.log("Updating pages table...");
    
    // We will drop the pages table if it exists and recreate it to ensure the schema is perfect,
    // assuming there is no crucial user data since this is a new feature request. 
    // Wait, the prompt says "Do not remove current content", but we can seed it later.
    // Actually, let's just add the columns if they don't exist.
    
    // First, check if the table exists
    const checkTable = await query(`SHOW TABLES LIKE 'pages'`) as any[];
    if (checkTable.length === 0) {
      await query(`
        CREATE TABLE pages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          meta_title VARCHAR(255),
          meta_description TEXT,
          meta_keywords TEXT,
          canonical_url VARCHAR(255),
          og_title VARCHAR(255),
          og_description TEXT,
          og_image VARCHAR(255),
          status ENUM('published', 'draft') DEFAULT 'draft',
          show_in_menu BOOLEAN DEFAULT FALSE,
          menu_label VARCHAR(255),
          menu_order INT DEFAULT 0,
          parent_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("Created pages table.");
    } else {
      // Add missing columns if it exists
      const columnsToAdd = [
        "ADD COLUMN meta_keywords TEXT",
        "ADD COLUMN canonical_url VARCHAR(255)",
        "ADD COLUMN og_title VARCHAR(255)",
        "ADD COLUMN og_description TEXT",
        "ADD COLUMN og_image VARCHAR(255)",
        "ADD COLUMN show_in_menu BOOLEAN DEFAULT FALSE",
        "ADD COLUMN menu_label VARCHAR(255)",
        "ADD COLUMN menu_order INT DEFAULT 0",
        "ADD COLUMN parent_id INT NULL"
      ];
      
      for (const col of columnsToAdd) {
        try {
          await query(`ALTER TABLE pages ${col}`);
        } catch (e: any) {
          // Ignore duplicate column errors
          if (!e.message.includes("Duplicate column")) {
            console.error(`Error adding column: ${col}`, e);
          }
        }
      }
      console.log("Updated pages table schema.");
    }

    // 2. Create page_sections table
    console.log("Creating page_sections table...");
    await query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        section_type VARCHAR(100) NOT NULL,
        section_key VARCHAR(100) NOT NULL,
        category VARCHAR(100),
        title VARCHAR(255),
        subtitle TEXT,
        content LONGTEXT,
        data_json JSON,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
      )
    `);

    // 3. Create page_faqs table
    console.log("Creating page_faqs table...");
    await query(`
      CREATE TABLE IF NOT EXISTS page_faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
      )
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
}

migrate();

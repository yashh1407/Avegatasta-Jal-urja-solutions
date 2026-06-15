const mysql = require('mysql2/promise');

async function unlock() {
  const email = process.argv[2];
  if (!email) {
    console.error('Error: Please provide the email of the account to unlock.');
    console.log('Usage: node --env-file=.env.local scripts/unlock-user.js <email>');
    process.exit(1);
  }

  // Load from environment variables
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('Error: Database configuration environment variables are missing.');
    console.log('Make sure process.env.MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE are defined.');
    process.exit(1);
  }

  console.log(`Connecting to database ${dbConfig.database} on ${dbConfig.host}...`);
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if the user exists
    const [users] = await connection.query('SELECT id, name, email, failed_login_attempts, lockout_until FROM admin_users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.error(`Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current failed attempts: ${user.failed_login_attempts}`);
    console.log(`Current lockout until: ${user.lockout_until}`);

    // Update attempts and lockout
    await connection.query(
      'UPDATE admin_users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?',
      [user.id]
    );

    console.log(`\n🎉 Success: Account for "${email}" has been unlocked!`);
  } catch (err) {
    console.error('Database query failed:', err);
  } finally {
    await connection.end();
  }
}

unlock();

const bcrypt = require('bcrypt');
const db = require('./db');

async function seedAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'AdminPass123'; // predefined password
    const role = 'admin';

    // Check if admin user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert admin user with hashed password
    await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      [email, password_hash, role]
    );

    console.log(`Admin user created with email: ${email} and password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();

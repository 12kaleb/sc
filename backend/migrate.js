const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await db.query(schema);
    console.log('Database migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();

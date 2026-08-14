/**
 * Generate database-complete.sql with real bcrypt hash
 * Run: node generate-sql-with-hash.js
 */

const bcrypt = require('bcrypt');
const fs = require('fs');

async function generateSQL() {
  console.log('Generating password hash...');
  
  // Generate bcrypt hash for 'admin123'
  const passwordHash = await bcrypt.hash('admin123', 10);
  console.log('Password hash generated:', passwordHash);
  
  // Read SQL template
  const sqlTemplate = fs.readFileSync('database-complete.sql', 'utf8');
  
  // Replace placeholder with actual hash
  const sqlWithHash = sqlTemplate.replace(
    '$2b$10$YourHashedPasswordHere.Replace.With.Actual.BCrypt.Hash',
    passwordHash
  );
  
  // Write updated SQL
  fs.writeFileSync('database-ready-to-import.sql', sqlWithHash);
  
  console.log('✅ File created: database-ready-to-import.sql');
  console.log('');
  console.log('To import:');
  console.log('psql -U postgres -d garment_production -f database-ready-to-import.sql');
}

generateSQL().catch(console.error);

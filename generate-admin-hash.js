// Generate bcrypt hash for admin password
const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n✅ Password Hash Generated:\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n📋 SQL to update Supabase:\n');
  console.log(`UPDATE "User" SET password = '${hash}' WHERE username = 'admin';`);
  console.log('\n');
});

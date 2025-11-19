/**
 * Script to update .env file with secure keys for development
 * Run with: node scripts/update-env.js
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Generate secure keys
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
const encryptionKey = crypto.randomBytes(32).toString('base64');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create it from .env.example first.');
  console.log('Run: cp .env.example .env');
  process.exit(1);
}

// Read current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update NEXTAUTH_SECRET (always update if it's a placeholder or insecure)
const needsNextAuthUpdate = envContent.includes('your-nextauth-secret') || 
                            envContent.includes('your-secret-key-here') ||
                            envContent.includes('NEXTAUTH_SECRET="crackgov') ||
                            envContent.match(/NEXTAUTH_SECRET="[^"]{0,20}"/); // Short insecure keys

if (needsNextAuthUpdate) {
  envContent = envContent.replace(
    /NEXTAUTH_SECRET=.*/g,
    `NEXTAUTH_SECRET="${nextAuthSecret}"`
  );
  console.log('✅ Updated NEXTAUTH_SECRET with secure key');
} else {
  console.log('ℹ️  NEXTAUTH_SECRET already set, skipping...');
}

// Update ENCRYPTION_KEY (always update if it's a placeholder or insecure)
const needsEncryptionUpdate = envContent.includes('your-32-byte-encryption-key') || 
                              envContent.includes('your-encryption-key') ||
                              envContent.includes('ENCRYPTION_KEY="crackgov') ||
                              envContent.match(/ENCRYPTION_KEY="[^"]{0,20}"/); // Short insecure keys

if (needsEncryptionUpdate) {
  envContent = envContent.replace(
    /ENCRYPTION_KEY=.*/g,
    `ENCRYPTION_KEY="${encryptionKey}"`
  );
  console.log('✅ Updated ENCRYPTION_KEY with secure key');
} else {
  console.log('ℹ️  ENCRYPTION_KEY already set, skipping...');
}

// Write updated content
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('\n✅ .env file updated successfully!');
console.log('\n📝 Generated keys:');
console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret}`);
console.log(`   ENCRYPTION_KEY: ${encryptionKey}`);
console.log('\n⚠️  Keep these keys secure and never commit them to version control!');


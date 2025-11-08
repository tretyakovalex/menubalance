// generate-secrets.js
const crypto = require('crypto');

// Generate a random 32-byte (256-bit) secret
const SESSION_SECRET = crypto.randomBytes(32).toString('hex');
const JWT_SECRET = crypto.randomBytes(32).toString('hex');

console.log('SESSION_SECRET=', SESSION_SECRET);
console.log('JWT_SECRET=', JWT_SECRET);

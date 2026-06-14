// netlify/functions/_auth.js
//
// Shared helper: verifies a session token created by verify-admin.js.
// Tokens are valid for 24 hours.

const crypto = require('crypto');

const TOKEN_VALID_MS = 24 * 60 * 60 * 1000; // 24 hours

function isValidToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-me';

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex');

  if (signature !== expectedSignature) return false;

  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  const age = Date.now() - tokenTime;
  if (age < 0 || age > TOKEN_VALID_MS) return false;

  return true;
}

module.exports = { isValidToken };

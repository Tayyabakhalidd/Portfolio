// netlify/functions/verify-admin.js
//
// Verifies the admin password against an environment variable
// (set in Netlify dashboard → Site settings → Environment variables → ADMIN_PASSWORD).
// The real password NEVER appears in the codebase or on GitHub.
//
// On success, returns a signed session token (simple HMAC) that the
// frontend stores and sends with every admin write request.

const crypto = require('crypto');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { password } = body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-me';

  if (!ADMIN_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server not configured. Set ADMIN_PASSWORD in Netlify environment variables.' }),
    };
  }

  if (!password || password !== ADMIN_PASSWORD) {
    // Small delay to slow down brute-force attempts
    await new Promise((r) => setTimeout(r, 500));
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, error: 'Incorrect password' }),
    };
  }

  // Create a signed token: timestamp + HMAC signature.
  // Token is valid for 24 hours.
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex');
  const token = `${timestamp}.${signature}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, token }),
  };
};

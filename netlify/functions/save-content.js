// netlify/functions/save-content.js
//
// Saves the portfolio content object to Netlify Blobs.
// Requires a valid admin session token (created by verify-admin.js)
// passed in the "x-admin-token" header.

const { getStore } = require('@netlify/blobs');
const { isValidToken } = require('./_auth');

const STORE_NAME = 'portfolio-content';
const KEY = 'content';
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB safety limit (covers profile picture as base64)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
  if (!isValidToken(token)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized. Please log in again.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { key, value } = body;
  if (!key || typeof key !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing "key" field' }) };
  }

  try {
    const store = getStore(STORE_NAME);
    const existing = (await store.get(KEY, { type: 'json' })) || {};

    existing[key] = value;

    const serialized = JSON.stringify(existing);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_SIZE_BYTES) {
      return {
        statusCode: 413,
        body: JSON.stringify({ error: 'Content too large. If uploading a profile picture, try a smaller image.' }),
      };
    }

    await store.setJSON(KEY, existing);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('save-content error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save content.' }) };
  }
};

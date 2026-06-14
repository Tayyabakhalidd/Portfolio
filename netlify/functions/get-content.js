// netlify/functions/get-content.js
//
// Returns the entire portfolio content object (skills, projects, education,
// agents, experience, socials, hero text, chatbot config, etc.) stored in
// Netlify Blobs. Publicly readable — no auth required, since this is just
// the data needed to render the public site.

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'portfolio-content';
const KEY = 'content';

exports.handler = async () => {
  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(KEY, { type: 'json' });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=10', // light caching, content updates within ~10s
      },
      body: JSON.stringify(data || {}),
    };
  } catch (err) {
    console.error('get-content error:', err);
    return {
      statusCode: 200, // don't break the site if blobs aren't set up yet
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    };
  }
};

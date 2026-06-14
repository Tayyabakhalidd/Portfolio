// netlify/functions/_store.js
//
// Returns a configured Netlify Blobs store.
//
// Netlify is supposed to auto-inject Blobs credentials into every
// deployed function, but in practice this sometimes fails with
// "MissingBlobsEnvironmentError" even when everything is configured
// correctly (a known platform quirk). To make this reliable, we
// support an explicit fallback using a Site ID + Personal Access
// Token, set as environment variables:
//
//   BLOBS_SITE_ID  — found in: Site configuration → General → Site details → Site ID
//   BLOBS_TOKEN    — a Personal Access Token from: User settings → Applications → Personal access tokens
//
// If these are set, they're used directly (most reliable).
// If not, we fall back to auto-detection (works in some environments).

const { getStore } = require('@netlify/blobs');

function getContentStore(storeName) {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;

  if (siteID && token) {
    return getStore({ name: storeName, siteID, token });
  }

  // Fall back to auto-detected context (may fail with
  // MissingBlobsEnvironmentError on some deploys)
  return getStore(storeName);
}

module.exports = { getContentStore };

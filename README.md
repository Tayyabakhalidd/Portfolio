# Tayyaba Khalid — Portfolio (Secure Admin Edition)

This project is a static portfolio site with a **secure, server-verified admin panel**.
The admin password is **never stored in the code** — it lives only in Netlify's
environment variables and is checked by a serverless function.

---

## 📁 Project Structure

```
├── index.html                          ← the entire site (frontend)
├── netlify.toml                        ← Netlify configuration
├── package.json                        ← dependencies (@netlify/blobs)
└── netlify/
    └── functions/
        ├── verify-admin.js             ← checks password, issues session token
        ├── _auth.js                    ← shared token-validation helper
        ├── get-content.js              ← returns all portfolio content (public)
        └── save-content.js             ← saves content (requires admin token)
```

---

## 🚀 Deployment Steps

### Step 1 — Push to GitHub

1. Create a new repository on GitHub (public is fine — no secrets are in the code)
2. Upload all the files in this folder to that repo
   - Easiest: on GitHub, click **"Add file" → "Upload files"**, drag in everything
   - Make sure the folder structure is preserved (`netlify/functions/...`)

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up (free — "Sign up with GitHub" is easiest)
2. Click **"Add new site" → "Import an existing project"**
3. Choose **GitHub**, authorize Netlify, and select your repository
4. Build settings:
   - **Build command**: leave empty
   - **Publish directory**: `.` (just a dot — the root)
5. Click **"Deploy site"**

Netlify will give you a URL like `https://random-name-12345.netlify.app` — your site is now live!

### Step 3 — Set Your Admin Password (IMPORTANT)

1. In Netlify, go to **Site settings → Environment variables**
2. Click **"Add a variable"**
3. Add:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: *(choose a strong password — this is your real admin password now)*
4. Add a second variable (recommended for extra security):
   - **Key**: `SESSION_SECRET`
   - **Value**: *(any long random string, e.g. generate one at randomkeygen.com)*
5. Click **"Save"**
6. Go to **Deploys** tab → click **"Trigger deploy" → "Deploy site"** (so the new env vars take effect)

### Step 4 — Test Admin Access

1. Visit your site: `https://your-site.netlify.app/`
2. Add `#admin-access` to the URL: `https://your-site.netlify.app/#admin-access`
3. Enter the password you set in Step 3
4. You should see the admin bar appear at the bottom and all edit panels become visible

### Step 5 — (Optional) Custom Domain

In Netlify: **Site settings → Domain management → Add a custom domain**. Follow their instructions to point your domain's DNS to Netlify.

---

## 🔒 How Security Works

- **Public visitors**: see the clean portfolio. All admin UI is hidden via CSS `display:none !important` and JavaScript — no editing tools are ever rendered for them.
- **Admin login**: when you enter the password at `#admin-access`, it's sent to `verify-admin.js`, which checks it against `ADMIN_PASSWORD` (server-side, never exposed). If correct, it returns a signed token valid for 24 hours.
- **Saving changes**: every edit calls `save-content.js` with your session token in the `x-admin-token` header. The function verifies the token's signature and expiry before writing to Netlify Blobs (the database).
- **Data storage**: all portfolio content (skills, projects, education, etc.) is stored centrally in **Netlify Blobs** — so every visitor sees the same up-to-date content, from any device.

If someone inspects your site's source code (even on a public GitHub repo), they will **not** find your password anywhere — it only exists in Netlify's environment variables.

---

## 🤖 Connecting Your n8n Chatbot

1. Go to `#admin-access` and log in
2. Scroll to the **AI Assistant** section
3. Paste your n8n **production** webhook URL (from a Chat Trigger node)
4. ⚠️ **Important**: if your n8n is running locally (`localhost:5678`), the chatbot will only work on your own computer. For it to work for all visitors online, you need:
   - **n8n Cloud** (paid/free trial — gives you a permanent public URL), OR
   - A self-hosted n8n instance reachable from the internet
5. In your n8n Chat Trigger node, set **Allowed Origins (CORS)** to `*` (or your Netlify domain) and make sure the workflow is **Active**
6. Click **"Test Connection"**, then **"Save & Connect"**

---

## 🔁 Making Future Edits

Just log in via `#admin-access` anytime — all changes save automatically and instantly to the live site for everyone. No redeployment needed for content changes (only needed if you edit the HTML/CSS/JS code itself, which auto-deploys on every GitHub push).

---

## 🆘 Troubleshooting

- **"Server not configured" error on login** → `ADMIN_PASSWORD` environment variable isn't set in Netlify, or you didn't redeploy after setting it.
- **Changes don't persist / disappear on refresh** → check the browser console for errors from `save-content`; likely an expired/missing token (log out and back in).
- **Chatbot doesn't respond** → check n8n workflow is Active, CORS is set, and the webhook URL is the *Production* URL (not Test URL).

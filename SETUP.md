# Cloudflare Sync Setup Guide

This tool features automatic real-time sync with Cloudflare. Whenever you edit tasks, dates, cash flows, or phases in Chrome, your changes are automatically pushed to a Cloudflare KV store and synced across all your devices.

---

## 📁 Required Folder Structure

Ensure your folder keeps this structure when deploying:

```text
your-folder/
├── index.html          (The main application)
├── _worker.js          (Cloudflare Pages Worker for Direct Upload / Drag-and-Drop)
├── functions/
│   └── api/
│       └── data.js     (Cloudflare Pages Function for Git-based deployment)
└── SETUP.md
```

> **Why both `_worker.js` and `functions/`?**
> Cloudflare Pages Direct Upload (Drag-and-Drop) requires `_worker.js` to execute serverless logic, while Git-based deployments support both. Having both guarantees it works regardless of how you deploy.

---

## 🚀 Step 1: Deploy to Cloudflare Pages (Free, 2 Minutes)

### Option A: Drag-and-Drop (Easiest, No Git Needed)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) and log in.
2. In the left sidebar, click **Workers & Pages**.
3. Click **Create Application** → select the **Pages** tab → click **Upload assets**.
4. Enter a **Project name** (e.g. `my-gantt-tracker`).
5. Drag and drop this entire folder (`files` containing `index.html` and `_worker.js`) into the upload box.
6. Click **Deploy site**.

### Option B: Cloudflare Native Git Integration
1. Push this folder to a GitHub repository.
2. In Cloudflare Dashboard → **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**.
3. Select your repository, leave Build settings empty / default, and click **Save and Deploy**.

### Option C: Automate with GitHub Actions
Two ready-to-use workflows have been created in `.github/workflows/`:

1. **Deploy to Cloudflare Pages via GitHub Actions** (`.github/workflows/deploy-cloudflare.yml`):
   - In GitHub: Go to your repo → **Settings** → **Secrets and variables** → **Actions**.
   - Add secret `CLOUDFLARE_API_TOKEN`: Cloudflare Dashboard → My Profile → API Tokens → Create Token ("Edit Cloudflare Workers" template).
   - Add secret `CLOUDFLARE_ACCOUNT_ID`: Found on the right sidebar of the Workers & Pages dashboard in Cloudflare.
   - Every `git push` automatically deploys to Cloudflare Pages!

2. **Deploy to GitHub Pages via GitHub Actions** (`.github/workflows/deploy-github-pages.yml`):
   - In GitHub: Go to your repo → **Settings** → **Pages** → under **Source**, select **GitHub Actions**.
   - No API secrets required! Every `git push` will deploy your site to `https://<username>.github.io/<repo>/`.
   - You can link it to your Cloudflare URL via the top sync button to sync data.

---

## 🗄️ Step 2: Create KV Storage and Bind `DATA_KV`

Cloudflare uses **Workers KV** as the database to store your workspace JSON data.

1. In the Cloudflare sidebar, click **Storage & Databases** → **KV**.
2. Click **Create a namespace**:
   - Namespace name: `GANTT_DATA` (or any name you prefer).
   - Click **Add**.
3. Now go back to **Workers & Pages** → click on your **Pages project** (`my-gantt-tracker`).
4. Click **Settings** → **Bindings** (or **Functions** → **KV namespace bindings** depending on your dashboard version).
5. Click **Add binding** (or **Add** under KV namespace bindings):
   - **Variable name**: `DATA_KV` *(⚠️ Must be exact uppercase `DATA_KV`)*
   - **KV namespace**: Select `GANTT_DATA`.
6. Click **Save**.
7. Go to the **Deployments** tab → on your latest deployment, click the **...** menu and choose **Retry deployment** (or redeploy) so the KV binding takes effect.

---

## 🔒 Step 3: (Optional) Password-Protect Your Sync

To prevent unauthorized people from reading or modifying your data:
1. In your Pages project → **Settings** → **Environment variables**.
2. Add a variable:
   - **Variable name**: `SYNC_KEY`
   - **Value**: *Any secret passphrase of your choice*
3. Save and redeploy.
4. Next time you open the app in Chrome, click the sync badge or **☁️ Sync Now** and enter your passphrase once. The browser will remember it.

---

## 💻 Step 4: How to Use in Chrome

You have two convenient ways to use the tool:

### Method 1: Use the Deployed Cloudflare URL (Recommended)
- Open `https://your-project-name.pages.dev` in Chrome on your PC, Mac, iPad, or phone.
- The status badge in the top bar will show 🟢 **Synced**.
- **Every time you make any edit in Chrome**, it automatically saves locally and syncs to Cloudflare after 1.2 seconds!

### Method 2: Use the Local `index.html` File in Chrome
- If you open `index.html` directly from your hard drive (`file:///...`):
- Click the status pill in the toolbar (or click **☁️ Sync Now**).
- Enter your Cloudflare Pages URL (e.g. `https://your-project-name.pages.dev`).
- The local file will now sync directly with your Cloudflare cloud storage across devices!

---

## 🟢 Status Badge Indicators

- 🟢 **Synced**: Up to date with Cloudflare.
- 🔵 **Syncing… / Pending…**: Edits detected, saving to Cloudflare.
- 🟠 **Local file / Local only**: Working in offline mode or waiting for Cloudflare URL setup. Click the badge to configure.
- 🔴 **Sync failed**: Endpoint unreachable or binding missing. Click the badge to see error details.

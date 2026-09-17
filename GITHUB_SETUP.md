# 🐙 Free GitHub Sync Guide (Zero Cloudflare Needed)

You can sync your workspace data directly with your **GitHub repository** completely for free. No Cloudflare account, no credit card, and no paid hosting required!

---

## 💡 How It Works

1. **Your Database is GitHub**: Your project data is saved in a file named `data.json` directly inside your GitHub repository.
2. **Auto-Sync from Chrome**: Whenever you edit tasks, dates, or financial cash flow in Chrome, the app automatically commits the updated data to GitHub via the GitHub REST API.
3. **Free Hosting with GitHub Pages**: GitHub Actions automatically hosts and deploys your HTML tool for free at `https://<your-username>.github.io/<repo-name>/`.
4. **Cross-Device Access**: Open the website on your phone, laptop, or home computer — it automatically loads the latest `data.json` from GitHub.

---

## 🚀 Quick Setup (Takes 1 Minute)

### Step 1: Create a GitHub Personal Access Token (PAT)
To allow Chrome to commit data to your repository:

1. On GitHub, click your profile picture in the top-right corner → **Settings**.
2. Scroll to the bottom of the left sidebar → click **Developer settings**.
3. Click **Personal access tokens** → **Tokens (classic)** (or Fine-grained tokens).
4. Click **Generate new token** → **Generate new token (classic)**:
   - **Note**: `Gantt Tool Sync`
   - **Expiration**: 90 days (or No expiration)
   - **Select scopes**: Check the **`repo`** box (Full control of private repositories and contents).
5. Click **Generate token** at the bottom and copy the token (starts with `ghp_...`).

---

### Step 2: Connect in the Tool
1. Open [`index.html`](file:///C:/Users/Maged%20Magdy/Downloads/files/index.html) in Chrome (either locally or on your GitHub Pages URL).
2. In the top toolbar, click **⚙️ Sync** (or click the sync status pill).
3. Fill in the fields:
   - **GitHub Repository**: `your-username/your-repo-name` (e.g. `maged/gantt-tracker`)
   - **Branch**: `main`
   - **File Path**: `data.json`
   - **Personal Access Token**: Paste the `ghp_...` token you copied.
4. Click **Save & Connect**.

---

### Step 3: Enable Free GitHub Pages Hosting (GitHub Actions)
1. Push this project folder to your GitHub repository.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-github-pages.yml` will automatically build and publish your site to `https://<your-username>.github.io/<repo-name>/`!

---

## 🟢 What You See in Chrome

- 🟢 **GitHub: Synced**: Your data is successfully synced with GitHub.
- 🔵 **Syncing to GitHub…**: You just made an edit; changes are being committed to `data.json`.
- 🟠 **Local only (Click to connect GitHub)**: Not connected yet; edits are saved safely in your local browser storage.
- 🔴 **GitHub: Invalid token**: Your token expired or does not have `repo` write permissions. Click **⚙️ Sync** to re-enter.

# hiqanalytix — Master Setup & Deployment Guide

Explained like you have never coded before. You will finish this guide with:
- A copy of the website running on your **own laptop** (frontend on `localhost:3000`, backend on `localhost:8080`).
- The **same website live on the internet**, served from your **GoDaddy domain** (e.g. `www.hiqanalytix.com`).

You do **not** need any paid cloud account beyond the domain you already bought from GoDaddy — we use **Vercel** (free) for the React frontend and **Render** (free tier) for the Java Spring Boot backend.

---

# PART A — Run the website on your laptop

## Step 1. Install the tools (one-time, ~15 min)

Do these in order. Each install has a "next → next" wizard.

1. **Node.js 20 LTS** — https://nodejs.org → download the **LTS** installer → install with defaults.
2. **Yarn** — open a new terminal and paste:
   ```bash
   npm install -g yarn
   ```
3. **Java 21 (Temurin)** — https://adoptium.net → pick **Temurin 21 (LTS)** → install with defaults.
4. **IntelliJ IDEA Community (free)** — https://www.jetbrains.com/idea/download → install with defaults.
5. **Git** (only if you don't have it) — https://git-scm.com/downloads → install with defaults.

Verify everything works. Open a **new** terminal window and paste each line:
```bash
node -v      # expect v20.x.x
yarn -v      # expect 1.22.x
java -version  # expect 21.x.x
git --version  # expect any version
```
If any command says "not found", close the terminal and open a fresh one — the installers add themselves to the PATH only in new terminals.

---

## Step 2. Get the project files

Two ways:

### Option A — you have a ZIP from Emergent
1. Unzip it somewhere friendly like `~/projects/hiqanalytix`.

### Option B — you use "Save to GitHub" in Emergent
1. Click **Save to GitHub** in the chat input.
2. On your laptop:
   ```bash
   cd ~/projects
   git clone https://github.com/<your-username>/<your-repo>.git hiqanalytix
   ```

You should now see this folder layout:
```
hiqanalytix/
├── frontend/                    # React app
├── backend/                     # FastAPI (used in Emergent preview only)
├── deliverables/spring-boot/    # Java Spring Boot backend (what we run locally)
└── SETUP_GUIDE.md               # this file
```

---

## Step 3. Start the Java backend (contact form API)

1. Open **IntelliJ IDEA** → **File → Open…** → select `hiqanalytix/deliverables/spring-boot` → **Open as Project** → **Trust Project**.
2. Wait 1–3 minutes while IntelliJ downloads Maven dependencies (progress bar bottom-right).
3. In the left tree open:
   `src/main/java/com/hiqanalytix/contactapi/ContactApiApplication.java`
4. Click the green **▶ (Run)** icon next to the `main` method.
5. Watch the "Run" panel. When you see:
   ```
   Tomcat started on port(s): 8080 (http)
   ```
   the backend is up.

Test it in a new terminal:
```bash
curl http://localhost:8080/api/health
# {"status":"healthy","service":"hiqanalytix-api"}
```

Bonus: open http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:hiqdb`
- User: `sa` — Password: *(blank)*
- Click **Connect**. Every contact form submission appears in the `CONTACTS` table.

---

## Step 4. Start the React frontend

1. Open a **new** terminal (leave the Java one running):
   ```bash
   cd ~/projects/hiqanalytix/frontend
   yarn install         # ~1 minute, only the first time
   ```

2. Point the frontend at your local Java backend. Open `frontend/.env` in any text editor and change **only** this line:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8080
   ```
   Save the file.

3. Start the frontend:
   ```bash
   yarn start
   ```
   Your browser auto-opens at **http://localhost:3000** — you now see the hiqanalytix website.

4. Scroll to **Contact us**, fill the form, click **Send message**.
   - Green success toast → the record is in `/h2-console` under `CONTACTS`. ✅

Congrats — full stack running on your laptop. To stop: press `Ctrl + C` in each terminal.

---

# PART B — Take the site live on your GoDaddy domain

We will:
1. Publish the React frontend to **Vercel** (free, best-in-class for React).
2. Publish the Java backend to **Render** (free tier, easy for Spring Boot).
3. Point your **GoDaddy domain** to Vercel.

Total cost beyond the domain you already bought: **$0**.

## Step 5. Put your code on GitHub (required by Vercel & Render)

If you used "Save to GitHub" in Emergent you are done — skip to Step 6.

Otherwise:
1. Sign in to https://github.com → click **+ → New repository** → name it `hiqanalytix` → **Private** → **Create**.
2. In the terminal:
   ```bash
   cd ~/projects/hiqanalytix
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hiqanalytix.git
   git push -u origin main
   ```

## Step 6. Deploy the Java backend to Render

1. Go to https://render.com → **Sign up** with GitHub.
2. **New +** → **Web Service** → **Build and deploy from a Git repository** → **Connect** and pick your `hiqanalytix` repo.
3. Fill the form exactly like this:
   - **Name**: `hiqanalytix-api`
   - **Region**: any close to your users
   - **Branch**: `main`
   - **Root Directory**: `deliverables/spring-boot`
   - **Runtime**: `Docker` **or** `Java` — pick **Java**
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/contact-api-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: `Free`
4. Under **Environment** add: `PORT` = `10000` (Render sets this automatically; leave as-is if pre-filled).
5. Click **Create Web Service**. First deploy takes ~5 minutes.
6. When status is **Live**, Render shows your API URL like:
   `https://hiqanalytix-api.onrender.com`

Test it in a browser: `https://hiqanalytix-api.onrender.com/api/health` → should show `{"status":"healthy"…}`.

> **Note on Render free tier**: it sleeps after 15 min idle and wakes up on the next request (10-30s cold start). For a business site upgrade to **Starter ($7/mo)** later.

### 6a. Allow your future domain in CORS
Open `deliverables/spring-boot/src/main/java/com/hiqanalytix/contactapi/config/CorsConfig.java` and change the allowed origins to include your GoDaddy domain and your Vercel URL (we get the Vercel URL in the next step, come back and update):

```java
.allowedOrigins(
    "http://localhost:3000",
    "https://hiqanalytix.com",
    "https://www.hiqanalytix.com",
    "https://hiqanalytix.vercel.app"
)
```
Commit and push — Render redeploys automatically:
```bash
git add . && git commit -m "cors: add prod domains" && git push
```

## Step 7. Deploy the React frontend to Vercel

1. Go to https://vercel.com → **Sign up** with GitHub.
2. **Add New… → Project** → pick your `hiqanalytix` repo → **Import**.
3. On the configuration screen:
   - **Framework Preset**: `Create React App` (auto-detected)
   - **Root Directory**: click **Edit** → set it to `frontend`
   - **Build Command**: leave default (`yarn build` or `npm run build`)
   - **Output Directory**: `build`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | `https://hiqanalytix-api.onrender.com` |
5. Click **Deploy**. ~2 minutes later the site is live at something like `https://hiqanalytix.vercel.app`.

Test the form on the Vercel URL — it should show a success toast and the record should land in Render's H2 database.

## Step 8. Connect your GoDaddy domain to Vercel

You bought `hiqanalytix.com` (or similar) from GoDaddy. Here is exactly how to point it at your Vercel site.

### 8a. Add the domain in Vercel
1. In Vercel go to your project → **Settings → Domains**.
2. Type `hiqanalytix.com` → **Add**.
3. Vercel now shows two DNS records to create. **Keep this tab open** — you will copy the values in the next step. They look like:
   - `A record` for `@` → value `76.76.21.21`
   - `CNAME record` for `www` → value `cname.vercel-dns.com`

Also add `www.hiqanalytix.com` in Vercel the same way (Add → type it → confirm).

### 8b. Update DNS in GoDaddy
1. Log in at https://dcc.godaddy.com/domains → click **DNS** next to your domain.
2. You will see a list of DNS records. **Delete** any existing `A` record where **Name = @** that points to a GoDaddy parking IP, and any `CNAME` where **Name = www** that points somewhere else.
3. Click **Add New Record** and create these two records:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | `A`     | `@`   | `76.76.21.21`          | 600 seconds |
   | `CNAME` | `www` | `cname.vercel-dns.com` | 600 seconds |

4. Click **Save**.

### 8c. Wait, then verify
- DNS changes usually go live in **5–30 minutes** (occasionally a few hours).
- Back in Vercel → **Settings → Domains**, refresh. Both `hiqanalytix.com` and `www.hiqanalytix.com` should turn to a green **Valid Configuration**.
- Open `https://hiqanalytix.com` in your browser — HTTPS certificate is issued **automatically** by Vercel. 🎉

## Step 9. Final production checklist

- [ ] Contact form on your live domain shows a green success toast.
- [ ] `https://hiqanalytix-api.onrender.com/api/health` returns healthy.
- [ ] `https://hiqanalytix.com` and `https://www.hiqanalytix.com` both load.
- [ ] `CorsConfig.java` includes your live domain (redeploy Render if you had to change it).
- [ ] Replace `hello@hiqanalytix.com` and `+1 (555) 010-4477` in `frontend/src/components/site/Contact.jsx` with your real details, push to GitHub — Vercel auto-redeploys.

---

# Common problems & fixes

| Symptom | Fix |
|---|---|
| **Form shows "Something went wrong"** | Open browser DevTools (`F12`) → Network tab → click the failed request. If you see a red `CORS` error, add your domain to `CorsConfig.java` and push. If you see 404, `REACT_APP_BACKEND_URL` in Vercel is wrong — set it and redeploy. |
| **"This site can't be reached" on hiqanalytix.com** | DNS not propagated yet — wait 30 min. Check https://dnschecker.org — enter `hiqanalytix.com` → the world map should mostly show green `76.76.21.21`. |
| **Backend is really slow on first hit** | Render free tier cold start. Upgrade to Starter ($7/mo) or hit `/api/health` on a schedule using https://cron-job.org. |
| **`java: not found` in IntelliJ Run panel** | IntelliJ → **File → Project Structure → Project SDK** → pick your installed JDK 21. |
| **`Port 3000 is already in use`** | `yarn start` will offer to use port 3001 — say yes, or kill the other process. |
| **`Port 8080 is already in use`** | Open `deliverables/spring-boot/src/main/resources/application.properties`, change `server.port=8081`, and update `REACT_APP_BACKEND_URL` in `frontend/.env` to `http://localhost:8081`. |
| **I changed a file — how do I redeploy?** | Just `git add . && git commit -m "…" && git push`. Vercel and Render both auto-deploy on push to `main`. |

You're live. Send a couple of test enquiries through the live form — you'll see them in Render's H2 console. Welcome online 🎉

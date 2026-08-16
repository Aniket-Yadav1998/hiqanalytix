# hiqanalytix — Master Setup & Deployment Guide

> **📄 Where is this file?**
> The full guide you're reading right now lives in your project folder at:
> ```
> hiqanalytix/SETUP_GUIDE.md
> ```
> On GitHub it will be at the root of your repository (top of the file list on the repo homepage). You can open it in any text editor, VS Code, IntelliJ, or view it rendered on GitHub — every heading is clickable.

> Written like you have **never** built a website before. Every step is one you can copy-paste. By the end you will have:
>
> 1. The full website running on **your laptop** (React on `localhost:3000` + Java Spring Boot on `localhost:8080` + a **local database** where every contact/ROI form submission is saved).
> 2. The same website **live on the internet**, served from your GoDaddy domain **`https://hiqanalytix.com`**, with a **real, always-on cloud database**.
> 3. A way to **see every lead** (contact enquiries + ROI calculator submissions) directly in the database.
> 4. Strong SEO so `hiqanalytix.com` starts showing up on Google when people search for a Power BI or automation **consulting firm / consultancy**.
>
> **Total extra cost beyond the GoDaddy domain you already own: $0** using the free tiers of Vercel and Render.

---

## Table of contents

- [Part A — Understand what you have](#part-a)
- [Part B — Install the tools once](#part-b)
- [Part C — Get the project code](#part-c)
- [Part D — Run the database locally](#part-d)
- [Part E — Run the Java backend locally](#part-e)
- [Part F — Run the React frontend locally](#part-f)
- [Part G — Push your code to GitHub](#part-g)
- [Part H — Deploy the database to the cloud (free)](#part-h)
- [Part I — Deploy the Java backend to Render (free)](#part-i)
- [Part J — Deploy the React frontend to Vercel (free)](#part-j)
- [Part K — Connect your GoDaddy domain](#part-k)
- [Part L — See your leads in the live database](#part-l)
- [Part M — Rank on Google (SEO launch checklist)](#part-m)
- [Part N — Common problems & fixes](#part-n)

---

<a id="part-a"></a>
## Part A — Understand what you have

Inside the `hiqanalytix` folder you have three things:

```
hiqanalytix/
├── frontend/                    # The website you see in the browser (React)
├── backend/                     # Python/FastAPI backend used in the Emergent preview only
├── deliverables/spring-boot/    # Java Spring Boot backend — this is what YOU will run
└── SETUP_GUIDE.md               # this file
```

**What runs where in the finished setup**

| Piece            | Local (your laptop)                | Live (your customers)                     |
| ---------------- | ---------------------------------- | ----------------------------------------- |
| Website (React)  | `http://localhost:3000`            | `https://hiqanalytix.com` (Vercel)        |
| API (Java)       | `http://localhost:8080`            | `https://hiqanalytix-api.onrender.com` (Render) |
| Database         | H2 file (`./data/hiqdb.mv.db`)     | PostgreSQL on Render (persistent)         |

You do **not** need to install PostgreSQL locally — H2 (already bundled) is a real, file-based SQL database that requires zero setup. You will only meet PostgreSQL when we go live.

---

<a id="part-b"></a>
## Part B — Install the tools once (~15 minutes)

Do each install in order. All installers use "Next → Next → Finish" wizards.

### B.1  Node.js 20 LTS  (for React)
- Go to https://nodejs.org → download the **LTS** installer for your OS → install with defaults.

### B.2  Yarn  (Node's package manager we use)
- Open a **new** terminal window (Command Prompt / PowerShell / Terminal) and paste:
  ```bash
  npm install -g yarn
  ```

### B.3  Java JDK 21  (for Spring Boot)
- Go to https://adoptium.net → pick **Temurin 21 (LTS)** → install with defaults.

### B.4  IntelliJ IDEA Community — free  (Java editor)
- Get it at https://www.jetbrains.com/idea/download → install with defaults.

### B.5  Git  (only if you don't have it)
- https://git-scm.com/downloads → install with defaults.

### B.6  Verify everything
Open a **new** terminal window (important: PATH changes only apply in fresh terminals) and run:
```bash
node -v         # expect v20.x.x
yarn -v         # expect 1.22.x
java -version   # expect 21.x.x
git --version   # any version
```
If any command says *"not found"*, close all terminals and open a new one. Still stuck? Reboot — that resets your PATH.

---

<a id="part-c"></a>
## Part C — Get the project code

Two options:

**Option 1 — ZIP file**: unzip it to a friendly location like `~/projects/hiqanalytix`.

**Option 2 — Save to GitHub** (recommended, needed later for deployment): in the Emergent chat input click **"Save to GitHub"**, sign in, pick a repository name. Then on your laptop:
```bash
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/<your-username>/<your-repo>.git hiqanalytix
cd hiqanalytix
```

---

<a id="part-d"></a>
## Part D — Run the database locally

**Good news: you don't have to install anything.** The Spring Boot backend is pre-configured to use **H2 File Mode**, which is a real SQL database stored in a single file at:

```
hiqanalytix/deliverables/spring-boot/data/hiqdb.mv.db
```

- The file is created automatically the first time Spring Boot starts.
- Every contact form submission and every ROI calculator submission is saved into two tables: `CONTACTS` and `ROI_LEADS`.
- Data survives restarts.
- To wipe the database and start fresh, just delete the `data/` folder.

You will meet the database directly in a friendly web UI in the next step (H2 Console).

---

<a id="part-e"></a>
## Part E — Run the Java backend locally

1. Open **IntelliJ IDEA** → **File → Open…** → select the folder `hiqanalytix/deliverables/spring-boot` → **Open as Project** → click **Trust Project**.
2. Wait 1–3 minutes while IntelliJ downloads Maven dependencies (progress bar bottom-right).
3. If IntelliJ complains about "Project SDK not defined", go to **File → Project Structure → Project → SDK** and pick the Temurin **21** JDK you installed in B.3.
4. In the left project tree open:
   ```
   src/main/java/com/hiqanalytix/contactapi/ContactApiApplication.java
   ```
5. Click the green **▶ (Run)** icon next to the `main` method.
6. In the Run panel, wait until you see:
   ```
   Tomcat started on port(s): 8080 (http)
   Started ContactApiApplication in X.X seconds
   ```
7. Verify it responds. Open a new terminal:
   ```bash
   curl http://localhost:8080/api/health
   # {"status":"healthy","service":"hiqanalytix-api"}
   ```

### E.1  Open the database browser (H2 Console)
1. In any browser go to **http://localhost:8080/h2-console**.
2. Fill in:
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:file:./data/hiqdb;AUTO_SERVER=TRUE`
   - **User Name**: `sa`
   - **Password**: *(leave empty)*
3. Click **Connect**.
4. On the left you'll see two tables: `CONTACTS` and `ROI_LEADS`. Right-click either → **Select** to see every submission.

---

<a id="part-f"></a>
## Part F — Run the React frontend locally

Open a **new** terminal (keep the Java one running).

```bash
cd ~/projects/hiqanalytix/frontend
yarn install         # ~1 minute, only the first time
```

Point the frontend at the local Java backend. Open `frontend/.env` in any text editor and change **just this line**:
```
REACT_APP_BACKEND_URL=http://localhost:8080
```
Save and close.

Start the site:
```bash
yarn start
```
Your browser auto-opens at **http://localhost:3000**.

### F.1  Test it end-to-end
1. Scroll to **Contact us**, fill the form, click **Send message** → green success toast appears.
2. Scroll to the **ROI Calculator**, fill it in, click **Show my savings** → the pie charts render.
3. Go to http://localhost:8080/h2-console → connect (same details as E.1) → open `CONTACTS` and `ROI_LEADS`. Your submissions are there. 🎉

To stop the servers: press `Ctrl + C` in each terminal.

---

<a id="part-g"></a>
## Part G — Push your code to GitHub (required by Vercel & Render)

If you used **Save to GitHub** in Emergent, skip this — your code is already on GitHub.

Otherwise:
1. Sign in to https://github.com → **+ → New repository** → name `hiqanalytix` → **Private** → **Create**.
2. Terminal:
   ```bash
   cd ~/projects/hiqanalytix
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hiqanalytix.git
   git push -u origin main
   ```

> **Important**: add `deliverables/spring-boot/data/` to a `.gitignore` so your local database file doesn't ship to production. Run:
> ```bash
> echo "deliverables/spring-boot/data/" >> .gitignore
> echo "deliverables/spring-boot/target/" >> .gitignore
> git add .gitignore && git commit -m "gitignore build & data" && git push
> ```

---

<a id="part-h"></a>
## Part H — Deploy the database to the cloud (free PostgreSQL on Render)

1. Sign up for https://render.com with your GitHub account (**free**, no credit card).
2. Top-right **New +** → **PostgreSQL**.
3. Fill in:
   - **Name**: `hiqanalytix-db`
   - **Database**: `hiqdb`
   - **User**: leave default (`hiqdb_user`)
   - **Region**: any close to your users
   - **Plan**: **Free**
4. Click **Create Database**. It takes ~1 minute to provision.
5. When status is **Available**, scroll to **Connections** and copy these three values into a scratch notepad — you'll paste them into the backend service next:
   - **Internal Database URL** — looks like `postgresql://hiqdb_user:xxxx@dpg-xxxx/hiqdb`
   - **Username** — `hiqdb_user`
   - **Password** — auto-generated

We will convert the Internal URL to Spring Boot's JDBC format in Part I.

> Render's free PostgreSQL is deleted after 90 days of inactivity. For a business site upgrade to the $7/mo Starter plan when you're ready.

---

<a id="part-i"></a>
## Part I — Deploy the Java backend to Render

1. In Render click **New + → Web Service** → **Build and deploy from a Git repository** → **Connect** → pick your `hiqanalytix` repo.
2. Fill the form exactly like this:
   | Setting | Value |
   |---|---|
   | **Name** | `hiqanalytix-api` |
   | **Region** | same as your DB |
   | **Branch** | `main` |
   | **Root Directory** | `deliverables/spring-boot` |
   | **Runtime** | `Java` |
   | **Build Command** | `./mvnw clean package -DskipTests` |
   | **Start Command** | `java -jar target/contact-api-0.0.1-SNAPSHOT.jar` |
   | **Instance Type** | `Free` |
3. Scroll to **Environment Variables → Add Environment Variable** and add these **four** variables. Convert the Internal DB URL you copied in Part H (format: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME`) into these four values:

   | Key | Value |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://<HOST>:<PORT>/<DBNAME>` (drop the user & password from the URL) |
   | `DB_USERNAME` | `<USER>` from the URL |
   | `DB_PASSWORD` | `<PASSWORD>` from the URL |
   | `DB_DRIVER` | `org.postgresql.Driver` |
   | `DB_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` |

   Example: if Render gave you `postgresql://hiqdb_user:AbCdEf@dpg-1234-a.oregon-postgres.render.com:5432/hiqdb`, then:
   - `DB_URL` = `jdbc:postgresql://dpg-1234-a.oregon-postgres.render.com:5432/hiqdb`
   - `DB_USERNAME` = `hiqdb_user`
   - `DB_PASSWORD` = `AbCdEf`

### I.1  Turn on lead email notifications (Resend)
Every submission from the Contact form and the ROI calculator can auto-email your sales inbox — this is already wired in the code. To turn it on:

1. Sign up (free) at https://resend.com → **API Keys → Create API Key** → copy the value (starts with `re_...`).
2. Verify your domain in Resend: **Domains → Add Domain** → type `hiqanalytix.com` → Resend shows 3 DNS records (SPF `TXT`, DKIM `TXT`, and a return-path `MX`). Add those in GoDaddy → **DNS**. Wait 15–30 min → click **Verify** in Resend. This lets you send emails **from** your own domain (e.g. `hello@hiqanalytix.com`) which greatly improves deliverability.
3. In the Render dashboard for `hiqanalytix-api` (or the FastAPI service) add these environment variables:

   | Key | Value |
   |---|---|
   | `RESEND_API_KEY` | `re_xxx…` from step 1 |
   | `SENDER_EMAIL` | `hello@hiqanalytix.com` (or `onboarding@resend.dev` while you're still verifying) |
   | `SALES_EMAIL` | The inbox that should receive every new lead, e.g. `sales@hiqanalytix.com` |

4. Redeploy. Test by submitting the contact form on your live site — you should get a nicely formatted HTML email within 10 seconds.

> Emails are **best-effort and non-blocking**. If Resend is down or `RESEND_API_KEY` is empty, the form still returns 201 immediately and the lead is safely in the database. Nothing is ever lost.

4. Click **Create Web Service**. First deploy takes ~5 minutes.
5. When status is **Live**, Render shows the API URL, e.g. `https://hiqanalytix-api.onrender.com`.
6. Verify: open `https://hiqanalytix-api.onrender.com/api/health` → should return `{"status":"healthy"…}`.

### I.1  Update CORS with your future domain
Open `deliverables/spring-boot/src/main/java/com/hiqanalytix/contactapi/config/CorsConfig.java` and set the origins to:
```java
.allowedOrigins(
    "http://localhost:3000",
    "https://hiqanalytix.com",
    "https://www.hiqanalytix.com",
    "https://hiqanalytix.vercel.app"
)
```
Push:
```bash
git add . && git commit -m "cors: add prod domains" && git push
```
Render redeploys automatically (~2 min).

> Free Render web services **sleep after 15 min idle** and cold-start on the next request (10–30 s). To keep it warm for free, use https://cron-job.org to hit `/api/health` every 10 minutes.

---

<a id="part-j"></a>
## Part J — Deploy the React frontend to Vercel

1. Sign up at https://vercel.com with GitHub.
2. **Add New… → Project** → pick your `hiqanalytix` repo → **Import**.
3. Configure:
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: click **Edit** → set to `frontend`
   - **Build Command**: default
   - **Output Directory**: `build`
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | `https://hiqanalytix-api.onrender.com` |
5. Click **Deploy** — ~2 minutes.
6. Vercel shows a live URL like `https://hiqanalytix.vercel.app`. Open it — the site should look identical to your local build.
7. Test the contact form and ROI calculator on the Vercel URL. Success toasts should appear, and records should now save into your **Render PostgreSQL** database (we'll browse them in Part L).

---

<a id="part-k"></a>
## Part K — Connect your GoDaddy domain

### K.1  Add the domain in Vercel
1. Vercel → your project → **Settings → Domains**.
2. Type `hiqanalytix.com` (replace with your actual domain) → **Add**.
3. Also add `www.hiqanalytix.com` the same way.
4. Vercel shows the two DNS records you need to create. They are:
   - `A record` for `@` → value `76.76.21.21`
   - `CNAME record` for `www` → value `cname.vercel-dns.com`
5. Keep this Vercel tab open.

### K.2  Update DNS in GoDaddy
1. Sign in at https://dcc.godaddy.com/domains → click **DNS** next to your domain.
2. **Delete** any existing `A` record where **Name = @** that points to a GoDaddy parking IP, and any existing `CNAME` where **Name = www**.
3. Click **Add New Record**. Create these two:

   | Type    | Name  | Value                    | TTL          |
   | ------- | ----- | ------------------------ | ------------ |
   | `A`     | `@`   | `76.76.21.21`            | 600 seconds  |
   | `CNAME` | `www` | `cname.vercel-dns.com`   | 600 seconds  |

4. Click **Save**.

### K.3  Wait, then verify
- DNS usually goes live in **5–30 minutes** (occasionally a few hours).
- In Vercel → **Settings → Domains**, refresh. Both domains should turn to a green **Valid Configuration**.
- Open `https://hiqanalytix.com` in your browser — HTTPS is issued **automatically** by Vercel. 🎉

You are officially live.

---

<a id="part-l"></a>
## Part L — See your leads in the live database

You have three ways to browse the live PostgreSQL:

### L.1  Render's web SQL shell (easiest)
1. Render → your **hiqanalytix-db** database → **Shell** tab.
2. Paste:
   ```sql
   SELECT id, name, email, company, created_at FROM contacts ORDER BY created_at DESC LIMIT 20;
   SELECT id, name, email, company, industry, current_manpower, projected_manpower, created_at FROM roi_leads ORDER BY created_at DESC LIMIT 20;
   ```

### L.2  Your API
- `GET https://hiqanalytix-api.onrender.com/api/contact` → JSON of all contact leads.
- `GET https://hiqanalytix-api.onrender.com/api/roi-estimate` → JSON of all ROI submissions.

### L.3  Any SQL client (DBeaver, TablePlus, pgAdmin)
- Use Render's **External Database URL** as the connection string (Render dashboard → your DB → **Connections**).
- Free tools: https://dbeaver.io, https://tableplus.com.

---

<a id="part-m"></a>
## Part M — Rank on Google (SEO launch checklist)

Your website already ships with:
- A strong `<title>` and meta description targeting **"Power BI consulting firm"** / **"automation consultancy"**.
- Rich keyword meta covering all 5 industries.
- Open Graph + Twitter card previews so LinkedIn, Slack, Twitter, WhatsApp all show a clean preview when someone shares your link.
- **JSON-LD structured data** describing hiqanalytix as an `Organization` + `ProfessionalService` — Google uses this for the rich brand panel on the right side of results.
- `/robots.txt` and `/sitemap.xml` pointing to `https://hiqanalytix.com/sitemap.xml`.
- A canonical URL of `https://hiqanalytix.com/` (no duplicate content penalty).

Do these five one-time actions the day your domain goes live:

### M.1  Verify the site in Google Search Console (5 min)
1. Go to https://search.google.com/search-console → **Add property** → **URL prefix** → type `https://hiqanalytix.com/` → **Continue**.
2. Google shows verification methods. Pick **HTML tag** — copy the `content="…"` value.
3. In your project open `frontend/public/index.html`. Right after the `<meta name="publisher" ...>` line paste:
   ```html
   <meta name="google-site-verification" content="PASTE_THE_VALUE_HERE" />
   ```
4. Commit + push:
   ```bash
   git add . && git commit -m "seo: gsc verification" && git push
   ```
5. Wait 1–2 min for Vercel to redeploy, then click **Verify** in Search Console.

### M.2  Submit your sitemap (2 min)
Still inside Search Console → left menu **Sitemaps** → paste `https://hiqanalytix.com/sitemap.xml` → **Submit**.

### M.3  Set up Bing Webmaster Tools (2 min)
1. https://www.bing.com/webmasters → **Import from Google Search Console** (free, one-click).
2. Submit the same `sitemap.xml`.

### M.4  Create a Google Business Profile (free, ~10 min)
1. https://www.google.com/business → **Manage now** → add "hiqanalytix" → pick category **"Business Management Consultant"**.
2. Add the same `hello@hiqanalytix.com` and phone number that appear on your Contact section.
3. Verify by postcard (only for the first business at your address) or by phone. This makes hiqanalytix appear on Google Maps and the local "consultancy near me" search results.

### M.5  Build a few high-signal backlinks
Priority actions that move the needle for a young consultancy site:
- Publish the company **LinkedIn Company Page** and link it back to `hiqanalytix.com` (add the URL to `index.html`'s `sameAs` JSON-LD too).
- Ask your first 3 clients for a short **case study permission** — publish them on the site (we already have a Case Studies section) and ask the client to share the URL from their own LinkedIn.
- List hiqanalytix on **Clutch.co** and **G2** under "Power BI consulting firms" and "IT consulting firms".
- If any team member is Microsoft-certified (PL-200/PL-300/PL-400/PL-500/PL-600), request inclusion in the **Microsoft Partner Directory** — that link is gold for SEO.

### M.6  Bonus: turn on Google Analytics 4 (5 min)
1. https://analytics.google.com → create a property for `hiqanalytix.com` → copy the `G-XXXXXXX` measurement ID.
2. Paste this snippet inside the `<head>` of `frontend/public/index.html` (replace the id):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXX');
   </script>
   ```
3. Commit + push. GA4 will start tracking within an hour.

### Expected timeline
- **Day 1–2**: Google indexes the homepage. Search `site:hiqanalytix.com` — you should see 1+ result.
- **Week 1–2**: All 8 sitemap URLs indexed.
- **Month 1–3**: You start ranking for **long-tail queries** (e.g. `hiqanalytix power bi consulting`, `power bi consulting firm for automotive OEE`).
- **Month 3–6**: Short-tail rankings begin (`power bi consultancy`, `automation consulting firm`) — this depends heavily on backlinks and content freshness. Post a case study or an insight article every 4–6 weeks to compound.

---

<a id="part-n"></a>
## Part N — Common problems & fixes

| Symptom | Fix |
|---|---|
| **"Something went wrong" on the live form** | Open browser DevTools (`F12`) → Network tab → click the red request. **CORS error?** Add your domain to `CorsConfig.java` and push. **404?** `REACT_APP_BACKEND_URL` in Vercel is wrong — fix it and redeploy. |
| **First live form submit takes 30 seconds** | Render free tier cold start. Upgrade to Starter ($7/mo) or hit `/api/health` on a schedule via https://cron-job.org. |
| **`java: not found` in IntelliJ Run panel** | IntelliJ → **File → Project Structure → Project SDK** → pick your installed JDK 21. |
| **`Port 3000 is already in use`** | Type `y` when `yarn start` asks to use 3001, or kill the other process. |
| **`Port 8080 is already in use`** | Edit `deliverables/spring-boot/src/main/resources/application.properties`, change `server.port=8081`, and update `REACT_APP_BACKEND_URL` in `frontend/.env` to `http://localhost:8081`. |
| **H2 Console cannot log in** | Make sure the JDBC URL matches exactly: `jdbc:h2:file:./data/hiqdb;AUTO_SERVER=TRUE`. Case sensitive. |
| **Render build fails with `permission denied ./mvnw`** | Run once in the repo `git update-index --chmod=+x deliverables/spring-boot/mvnw && git commit -m "chmod mvnw" && git push`. |
| **"This site can't be reached" on hiqanalytix.com** | DNS not propagated yet — wait 30 minutes. Check https://dnschecker.org — enter `hiqanalytix.com` → the world map should mostly show green `76.76.21.21`. |
| **I changed a file — how do I redeploy?** | `git add . && git commit -m "…" && git push`. Vercel and Render both auto-deploy on push to `main`. |
| **How do I wipe local DB?** | Stop Spring Boot, delete the `deliverables/spring-boot/data/` folder, start again. |
| **PostgreSQL DB paused after inactivity** | Render free databases pause after 30 days idle. Log in and click **Resume**, or upgrade to Starter. |

---

# You're done 🎉

- ✅ Full stack running locally with a real database
- ✅ Live on `https://hiqanalytix.com` with automatic HTTPS
- ✅ Every contact + ROI submission saved to a persistent cloud database
- ✅ You can see every lead in Render's SQL shell in one click

Send a couple of test submissions through the live form to confirm — you'll see them appear immediately in Render. Welcome to production. 🚀

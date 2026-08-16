# hiqanalytix — Product Requirements (PRD)

## Original problem statement
Build a premium enterprise-grade corporate website for **hiqanalytix**, a technology-services outsourcing firm specialising in Microsoft **Power Platform**, **Power BI dashboards** and **Automations**, serving five core industries: Financial, Automotive, Engineering, Energy and Health. Design references: Thoughtworks, Databricks, Buhler Group. Slogan: "Your trust is our responsibility." Full-stack (React + Java Spring Boot) with an H2-backed contact form and a beginner-friendly SETUP_GUIDE.md.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Framer Motion + Lenis (smooth scroll) + Sonner (toasts) + @phosphor-icons/react.
- **Backend (preview)**: FastAPI + MongoDB — serves `POST /api/contact` and `GET /api/contact` used by the live preview.
- **Backend (deliverable)**: Java 21 + Spring Boot 3.3 + Spring Data JPA + H2 in-memory DB in `/app/deliverables/spring-boot/` for the user to run locally in IntelliJ. Same API contract as the FastAPI backend.
- **SEO**: Semantic HTML, meta description/OG tags, Outfit + IBM Plex Sans via Google Fonts.

## User personas
- **Enterprise buyer** (CIO/Head of Data) evaluating outsourcing partners for BI/automation programs.
- **Line-of-business sponsor** (Ops/Finance director) looking for domain-specialised dashboards & RPA.
- **Recruiter/partner** researching capability & credibility.

## Core requirements (static)
1. Hero with brand, slogan, primary/secondary CTAs and headline metrics.
2. About section with team credibility and process bullets.
3. Services section with 3 cards: Power Platform, Power BI, Automations.
4. Industries section with 5 cards: Financial, Automotive, Engineering, Energy, Health.
5. Contact form (Name, Email, Phone, Company, Message) with frontend + backend validation and toast feedback.
6. Sticky glassmorphism navbar with smooth-scroll navigation.
7. Footer with company info, nav, services, industries.
8. Fully responsive; dark premium enterprise aesthetic; smooth scrolling.

## What's been implemented — 2026-01 (iteration 6)
- **Insights redesigned** — two-column layout with a **sticky left column** (INSIGHTS eyebrow, "Field notes from the trenches." title, subscribe CTA quote block) and a **vertical stack of post cards on the right** exactly as requested.
- **Each post card is now image + text**: 224px left thumbnail (16/10 aspect on mobile, side-by-side on desktop) with real Unsplash imagery mapped per category (Power BI charts, RPA circuit, automotive, financial trading, wind turbines, healthcare, semantic models, Power Platform teamwork, Copilot). Right side: date · read-time meta, bold title, excerpt, and "Read note" CTA. Category tag overlays the top-left of each image.
- **Progressive disclosure**: first render shows **exactly 5 posts**; a "**Load 3 more notes N/Total**" button reveals 3 more each click; when everything is shown the button is replaced with a "You're all caught up · N notes shown" line. State variable `visible = 5 + n * 3`.
- **Backend seed expanded to 9 posts** with `image_url` field added to `InsightPost` + `InsightCreate` models. Startup seed is now **self-healing**: if any existing docs are missing `image_url`, it deletes and reseeds to backfill.
- Card `data-testid=insight-card-{id}`, section `data-testid=insights-section`, list container `data-testid=insights-list`, button `data-testid=insights-load-more`.

## What's been implemented — 2026-01 (iteration 5)
- **Client Logos Strip** — new marquee strip directly under the hero ("Trusted by operators across five industries") with 10 tastefully-typed client tiles that pause on hover.
- **Lead Email Notifications** — Resend integration wired into both `POST /api/contact` and `POST /api/roi-estimate` via FastAPI `BackgroundTasks` + `asyncio.to_thread`. Emails render as clean HTML with all lead fields + computed ROI numbers. **Best-effort, non-blocking**: if `RESEND_API_KEY` is unset (or the send fails), the API still returns 201 immediately and the lead is safe in the DB. Health endpoint now reports `email_configured` boolean.
- **Insights Blog Section** — new `#insights` section titled "Field notes from the trenches." with 6 seeded posts. Backend adds `GET /api/insights` (list, sorted by published_at desc), `POST /api/insights` (validated create), and auto-seeds 6 posts on FastAPI startup (`_ensure_insights_seed`). Frontend fetches from the API with a graceful fallback list for cold-starts.
- **OG Cover Image** — 1200×630 `og-cover.png` generated with Pillow, matching the site's brand (orange blobs + grid, brand mark, "Your trust is our responsibility." headline, `hiqanalytix.com` + industries strip). Referenced in `og:image` + `twitter:image` meta tags.
- **Guide updated** — new sub-section **I.1** in `SETUP_GUIDE.md` walking the user through Resend signup, domain verification in GoDaddy DNS, and setting `RESEND_API_KEY`, `SENDER_EMAIL`, `SALES_EMAIL` env vars on Render.
- Testing agent iteration 4: **100% backend (20 pytest cases), 100% frontend** — clients strip, insights section, OG image accessibility (200 image/png >30KB), JSON-LD schema, non-blocking email behaviour all verified.

## What's been implemented — 2026-01 (iteration 4)
- **Domain locked to `hiqanalytix.com`** across meta tags, canonical URL, Open Graph, Twitter cards, JSON-LD schemas, sitemap.xml, robots.txt, footer copy, and setup guide.
- **Enterprise-grade SEO** — SEO-optimized title (`hiqanalytix — Power BI & Automation Consulting Firm | Your trust is our responsibility`), keyword-rich meta description, long-tail keyword meta, Open Graph + Twitter card previews, canonical link, robots directives, Google/Bing indexability.
- **JSON-LD structured data** — 3 schemas (`Organization`, `ProfessionalService`, `WebSite`) with slogan, services list, contact point, `sameAs` — powers Google's rich brand panel.
- **`/robots.txt` + `/sitemap.xml`** shipped in `frontend/public/` referencing 8 anchor URLs.
- **Copy SEO pass** — Hero, About, Footer now use "**consulting firm**" / "**consultancy**" language for keyword alignment (was "technology services partner").
- **Setup guide expanded** — added Part M (SEO launch checklist): Google Search Console verification, sitemap submission, Bing Webmaster Tools, Google Business Profile, backlink strategy (LinkedIn, Clutch, G2, Microsoft Partner Directory), optional GA4 snippet + expected timeline.
- Added a prominent "**📄 Where is this file?**" pointer at the top of the guide directing users to `hiqanalytix/SETUP_GUIDE.md`.

## What's been implemented — 2026-01 (iteration 3)
- Full React marketing site: Navbar, Hero, About, Services, **TechStack marquee**, **Case Studies**, **ROI Calculator (interactive, with pie charts backed by DB)**, Industries, Contact, Footer.
- **Light theme: white background + orange (#F97316) accent system**.
- **Text contrast pass**: all form labels, subtitles and bullets moved from grey (neutral-500/600) to near-black (neutral-800/900). Placeholders bumped from neutral-400 → neutral-500.
- **Industries images fixed**: removed washed-out white overlay, now full-color images with only a bottom half-height dark gradient so title + description remain readable.
- **Case Studies section**: 5 industry-specific case cards (Financial, Automotive, Engineering, Energy, Health) with 3 hard metrics each and a Microsoft-stack tag row.
- **ROI Calculator section**: 7-input lead-capture form (name, email, company, industry, current_manpower, current_hours_per_week, current_tools) → POST `/api/roi-estimate` → persists to DB → renders **three donut pie charts** (cost 35%, manpower 55%, time 35%) with computed projected people & hours + a "Book a discovery call" CTA. Uses Recharts.
- **New backend endpoints**: `POST /api/roi-estimate` (validated), `GET /api/roi-estimate` (list). Persists to `roi_leads` Mongo collection (preview) / `roi_leads` H2/PostgreSQL table (deliverable).
- **Spring Boot deliverable extended**: RoiEntity/Repository/Request/Controller added; `application.properties` now uses **file-based H2 locally + PostgreSQL via env vars in production** (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER`, `DB_DIALECT`); pom.xml includes PostgreSQL driver + Spring Actuator.
- **SETUP_GUIDE.md fully rewritten**: 13 parts (A-M) — understanding the layout, installing tools, running DB locally (H2 file mode), running Java backend, running React frontend, pushing to GitHub, provisioning Render free PostgreSQL, deploying Spring Boot to Render with env vars, deploying React to Vercel, connecting the GoDaddy domain with exact A/CNAME records, browsing leads in the live DB (Render shell / API / DBeaver), and troubleshooting table.
- Testing agent iteration 3: **100% backend, 100% frontend** (7 pytest cases + full Playwright E2E on both new sections and existing regressions).

## Backlog / Next tasks
### P0 (production readiness)
- Real logo/brand mark and favicon replacing the "hq" placeholder.
- Replace stock imagery with client-owned photography.

### P1 (growth features)
- Case-studies / testimonials section with client logos.
- Blog or Insights section (MDX or headless CMS).
- Google reCAPTCHA v3 on the contact form to reduce spam.
- Email notification of new leads (SendGrid or Resend integration).

### P2 (polish)
- Multi-language (EN / DE / FR) with i18next.
- CMS integration (Sanity/Contentful) so marketing can edit copy.
- Analytics dashboards for form conversion (already have posthog snippet).

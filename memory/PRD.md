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

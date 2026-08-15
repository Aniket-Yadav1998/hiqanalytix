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

## What's been implemented — 2026-01
- Full React marketing site (Navbar, Hero, About, Services, Industries, Contact, Footer).
- Smooth-scroll wrapper via Lenis + Framer Motion viewport reveals.
- FastAPI backend with `/api/health`, `POST /api/contact` (Pydantic validation), `GET /api/contact` (sorted desc).
- MongoDB persistence with ISO datetime serialization.
- Sonner toast success/error feedback wired into form submission.
- Complete Spring Boot deliverable (pom.xml, application.properties, ContactController/Entity/Repository/Request/Service, CorsConfig) in `/app/deliverables/spring-boot/`.
- Master `SETUP_GUIDE.md` at `/app/SETUP_GUIDE.md` explaining install → run for a total beginner.
- Testing agent: 100% pass on backend and frontend.

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

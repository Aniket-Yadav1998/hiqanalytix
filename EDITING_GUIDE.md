# HARVESTIQ LLP Website Editing Guide

This guide explains **where to edit every part of the website**. You do not need to search the whole project. Find the section you want below, open the listed file, edit the text or data, save it, and refresh the browser.

## 1. The most important folders

```text
hiqanalytix/
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Website section order
│   │   ├── index.css                 # Global colours, fonts and browser-wide styles
│   │   ├── App.css                   # App-level styles
│   │   ├── components/site/          # Main visible website sections
│   │   └── hooks/                    # Shared behaviour such as smooth scrolling
│   ├── public/                       # Images, PDF, SEO files and other public assets
│   ├── .env                          # Backend URL used by the frontend
│   ├── package.json                  # Start, build and test commands
│   └── tailwind.config.js            # Tailwind colour and font settings
├── backend/server.py                 # Preview API: forms and insights
├── deliverables/spring-boot/         # Main Java API for the local/deployed website
└── EDITING_GUIDE.md                  # This file
```

## 2. Quick section map

| Website area | File to edit | What you can change there |
|---|---|---|
| Website order | `frontend/src/App.js` | Add, remove, or move sections |
| Header / navbar | `frontend/src/components/site/Navbar.jsx` | Logo, menus, dropdown, header email, CTA |
| Hero/banner | `frontend/src/components/site/Hero.jsx` | Main headline, intro copy, hero buttons |
| Hero automation visual | `frontend/src/components/site/HeroAutomationFlow.jsx` | Automation flow labels and visual cards |
| Hero dashboard visual | `frontend/src/components/site/HeroDashboardMock.jsx` | Dashboard mock data and labels |
| About Us | `frontend/src/components/site/About.jsx` | About text, bullet points, image, trust badge |
| Services | `frontend/src/components/site/Services.jsx` | Service cards, titles, descriptions, icons |
| Analytics flow | `frontend/src/components/site/AnalyticsFlow.jsx` | Process steps and workflow messaging |
| Technology stack | `frontend/src/components/site/TechStack.jsx` | Technology names, chips and stack messaging |
| Client/logo strip | `frontend/src/components/site/ClientsStrip.jsx` | Client or partner names/logos |
| Case studies | `frontend/src/components/site/CaseStudies.jsx` | Case study cards, metrics and industries |
| ROI calculator | `frontend/src/components/site/RoiCalculator.jsx` | Form fields, calculations, result cards |
| Industries | `frontend/src/components/site/Industries.jsx` | Industry cards, images and descriptions |
| Insights/blog | `frontend/src/components/site/Insights.jsx` | Blog layout, fallback articles and loading |
| Startup India certificate | `frontend/src/components/site/Certification.jsx` | Certificate section, viewer and download link |
| Contact form | `frontend/src/components/site/Contact.jsx` | Contact copy, fields and email link |
| Footer | `frontend/src/components/site/Footer.jsx` | Footer text, navigation, services and industries |
| Global design | `frontend/src/index.css` | Site colours, fonts, focus outlines, scrollbar, global CSS |
| App-only design | `frontend/src/App.css` | Styles specific to the root app |
| Tailwind design tokens | `frontend/tailwind.config.js` | Brand colours, font names and Tailwind extensions |
| SEO and page title | `frontend/public/index.html` | Title, description, social preview and structured data |

## 3. How to start editing

### Run the frontend

Open PowerShell in the repository and run:

```powershell
cd C:\Users\andyy\Code\hiqanalytix\frontend
yarn start
```

Open `http://localhost:3000`.

The development server normally refreshes the page automatically after you save a file.

### Create the final production build

```powershell
cd C:\Users\andyy\Code\hiqanalytix\frontend
yarn build
```

Always run this before publishing important changes. A successful message says:

```text
The build folder is ready to be deployed.
```

## 4. Changing common website content

### Change a heading or paragraph

1. Find the section in the table above.
2. Open its `.jsx` file.
3. Search for the old words with `Ctrl + F`.
4. Replace only the text between the JSX tags.
5. Save and refresh the browser.

Example:

```jsx
<h2>Old heading</h2>
```

Change to:

```jsx
<h2>New heading</h2>
```

Do not remove the surrounding `className`, `id`, or `data-testid` unless you know they are no longer needed.

### Change a button

Search for the button text in the relevant component:

```jsx
<button>Book a demo</button>
```

You can change the words, but keep the `onClick`, `type`, `href`, and `data-testid` attributes because they control behaviour and testing.

### Change the order of sections

Open `frontend/src/App.js`. The section order is the order in which sections appear:

```jsx
<Hero />
<About />
<Services />
<AnalyticsFlow />
<TechStack />
<CaseStudies />
<RoiCalculator />
<Industries />
<Insights />
<Certification />
<Contact />
```

Move a component line up or down to move that section. To remove a section cleanly, remove both:

```jsx
import Insights from "@/components/site/Insights";
```

and:

```jsx
<Insights />
```

### Change the logo

Replace the image file:

```text
frontend/public/logo.jpeg
```

Keep the filename if you do not want to edit code. The header and footer already use `/logo.jpeg`.

If you use a different filename, update the `src` in:

- `frontend/src/components/site/Navbar.jsx`
- `frontend/src/components/site/Footer.jsx`

## 5. Editing the header and navigation

Open:

```text
frontend/src/components/site/Navbar.jsx
```

### Header email

Find `connect@hiqanalytix.com`. Update both the visible email text and the `mailto:` address if the email changes:

```jsx
<a href="mailto:connect@hiqanalytix.com">
    connect@hiqanalytix.com
</a>
```

### About dropdown options

At the top of `Navbar.jsx`, edit `aboutLinks`:

```jsx
const aboutLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
];
```

The `href` must match the `id` of a section. For example, `href: "#services"` opens the section with:

```jsx
<section id="services">
```

### Main navigation options

Edit the `links` list in the same file. Keep the `#` before section IDs:

```jsx
const links = [
    { href: "#insights", label: "Insights" },
];
```

The desktop and mobile menus use this same list, so one change updates both.

### Header CTA

Search for `Book a demo`. The CTA currently links to `#contact`. Change the text or target if needed.

## 6. Editing each content section

### Hero

File:

```text
frontend/src/components/site/Hero.jsx
```

Edit the headline, supporting paragraph, CTA labels, trust messages, and hero statistics. The two detailed visuals beside the hero are separate:

- `HeroAutomationFlow.jsx`
- `HeroDashboardMock.jsx`

### About Us

File:

```text
frontend/src/components/site/About.jsx
```

The bullet list is stored in the `bullets` array near the top. Replace a bullet or add another item there. The main image URL is stored in `aboutImg`.

### Services

File:

```text
frontend/src/components/site/Services.jsx
```

Service cards are usually stored in an array near the top. Edit the card title, description, icon, or accent data in that array. Keep each card's JSX structure so spacing and responsive design remain consistent.

### Analytics flow

File:

```text
frontend/src/components/site/AnalyticsFlow.jsx
```

Edit the workflow steps and labels. This section is visual, so short labels work better than long paragraphs.

### Technology stack

File:

```text
frontend/src/components/site/TechStack.jsx
```

Edit the technology names in the arrays near the top. To add a technology, add another string to the matching array. Do not add a duplicate unless it is intentional.

### Clients or partner strip

File:

```text
frontend/src/components/site/ClientsStrip.jsx
```

Edit the names or image references in the client list. If you add a logo image, place it in `frontend/public/` and reference it as `/filename.png`.

### Case studies

File:

```text
frontend/src/components/site/CaseStudies.jsx
```

Edit the case study data near the top: client/industry name, title, result, metric, description, and image. Keep numbers truthful and make the result easy to scan.

### Industries

File:

```text
frontend/src/components/site/Industries.jsx
```

Edit the industry cards and their image URLs. Use images that are wide enough for desktop cards and include meaningful `alt` text if you change the image markup.

## 7. Editing Insights / blog posts

Open the display component:

```text
frontend/src/components/site/Insights.jsx
```

The frontend loads articles from the API. It also contains fallback articles so the section can still display content when the API is unavailable.

### Recommended: add an article through the API

The preview FastAPI endpoint is:

```text
POST http://localhost:8000/api/insights
```

Example:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/api/insights `
  -ContentType "application/json" `
  -Body '{"title":"Your article title","excerpt":"A short article summary with at least twenty characters.","category":"Power BI","read_minutes":6,"image_url":"https://example.com/image.jpg"}'
```

Required article fields:

| Field | Meaning |
|---|---|
| `title` | Article title, 6-200 characters |
| `excerpt` | Card summary, 20-800 characters |
| `category` | Category such as Power BI or Automation |
| `read_minutes` | Reading time from 1 to 60 |
| `image_url` | Image URL; use a real image URL |

### Permanent seed articles

If the article must be included again after a database reset, edit `_SEED_INSIGHTS` in:

```text
backend/server.py
```

The frontend layout, card count, Load More behaviour, and API loading state remain in `Insights.jsx`.

## 8. Editing the Startup India certificate section

Component:

```text
frontend/src/components/site/Certification.jsx
```

Certificate file:

```text
frontend/public/startup-india-certificate.pdf
```

To replace the certificate, keep the same filename. The viewer, full-screen modal, open-in-new-tab action, and download action will continue to work automatically.

If you change the filename, update this line in `Certification.jsx`:

```jsx
const certificateUrl = "/startup-india-certificate.pdf";
```

The section is connected to:

- Header badge: `#credentials`
- Footer link: `#credentials`
- Section ID: `id="credentials"`

## 9. Editing the contact form

Open:

```text
frontend/src/components/site/Contact.jsx
```

This file controls the visible form, validation messages, submit button, contact email link, and success/error notifications.

The form sends data to:

```text
${REACT_APP_BACKEND_URL}/api/contact
```

The contact form currently includes:

- Full name
- Work email
- Country selector with major Indian, European, American and other developed-market country codes
- Mobile number validated against the selected country's expected digit length
- Optional telephone/landline number
- Industry dropdown: Financial, Automotive, Engineering, Energy, Health
- Problem statement

It also has four anti-spam checks: a required “I’m human” confirmation, a hidden honeypot field, a minimum 2.5-second review time, and a server-side limit of three contact submissions per IP in five minutes.

The APIs also return security headers (`nosniff`, frame protection, strict referrer policy, restricted browser permissions, and no caching for API responses). These protect the application, but a true network firewall/WAF must be enabled at the hosting layer, such as Cloudflare WAF, Vercel/Render edge protection, or a cloud load balancer. Never expose the API directly to the public internet without that layer in production.

To add or remove a country, edit the `countries` array in `Contact.jsx`. Each country has a flag, dial code, and accepted digit range:

```jsx
{ code: "IN", flag: "🇮🇳", name: "India", dial: "+91", digits: [10] }
```

To change the industries shown in the dropdown, edit the `industries` array in the same file. Keep the values aligned with the industries offered by the business.

If you add a new field, update all of these places:

1. The `initial` object.
2. The `validate` function.
3. The visible input JSX.
4. The object inside `axios.post`.
5. The backend request model and controller.

## 10. Editing the ROI calculator

Open:

```text
frontend/src/components/site/RoiCalculator.jsx
```

This file controls the form, validation, calculated result display, KPI cards, charts, and CTA. The API request is sent to:

```text
${REACT_APP_BACKEND_URL}/api/roi-estimate
```

If you change a calculation, update the backend too. The main backend calculation is `_compute_roi` in:

```text
backend/server.py
```

For the Java backend, update the ROI classes under:

```text
deliverables/spring-boot/src/main/java/com/hiqanalytix/contactapi/roi/
```

The frontend and backend must use the same field names.

## 11. Footer

Open:

```text
frontend/src/components/site/Footer.jsx
```

Edit:

- Company description.
- Tagline.
- Navigation list in `nav`.
- Services list in `services`.
- Industries list in `industries`.
- Footer copyright text.

If you add a new section link, make sure the target section has the matching `id`.

## 12. Images, PDF and public files

Put files that need a direct browser URL in:

```text
frontend/public/
```

Use them in JSX like this:

```jsx
<img src="/my-image.png" alt="Description of the image" />
```

Available important public files:

| File | Purpose |
|---|---|
| `logo.jpeg` | Header and footer logo |
| `startup-india-certificate.pdf` | Certificate viewer and download |
| `og-cover.png` | Social media preview image |
| `robots.txt` | Search crawler rules |
| `sitemap.xml` | Search engine sitemap |
| `index.html` | Page metadata and title |

Use a useful `alt` description for every meaningful image. Do not use an empty image source such as `src=""`.

## 13. Colours, fonts and premium styling

Most styling is written directly in JSX using Tailwind classes such as:

```jsx
className="bg-brand px-6 py-3 text-white hover:bg-brand-dark"
```

The shared brand values are defined in:

```text
frontend/tailwind.config.js
```

Global CSS is in:

```text
frontend/src/index.css
```

Use `index.css` for styles that should affect the whole website, such as:

- Global background.
- Selection colour.
- Keyboard focus outline.
- Scrollbar.
- Shared animations.
- Shared custom classes.

Use component JSX classes for a local change. This prevents a change to one section from unexpectedly changing every section.

## 14. Backend and environment settings

Frontend API URL:

```text
frontend/.env
```

Current local setting:

```text
REACT_APP_BACKEND_URL=http://localhost:8080
```

The local website uses the Java Spring Boot API on port `8080`. The Python FastAPI backend in `backend/` is used for preview/testing workflows and has its own environment variables.

Do not publish passwords, API keys, or database credentials in frontend files. Anything in `frontend/.env` beginning with `REACT_APP_` can be included in the browser build.

## 15. SEO and browser title

Open:

```text
frontend/public/index.html
```

Edit these values when the company positioning changes:

- `<title>`
- `meta name="description"`
- Open Graph title and description
- Open Graph image
- JSON-LD organization details

Also update `frontend/public/sitemap.xml` and `frontend/public/robots.txt` if URLs or domains change.

## 16. A safe editing checklist

Before publishing:

1. Make one small change at a time.
2. Save the file and check `http://localhost:3000`.
3. Test desktop and mobile widths.
4. Click the changed links and buttons.
5. Check the browser console for errors.
6. Run the production build:

```powershell
cd C:\Users\andyy\Code\hiqanalytix\frontend
yarn build
```

7. Check your changed files:

```powershell
cd C:\Users\andyy\Code\hiqanalytix
git status --short
```

## 17. Common mistakes

### The page is blank

Look at the terminal running `yarn start`. A missing bracket, quote, import, or comma usually appears there. Fix the first error shown.

### A navigation link does not work

The link and section ID must match exactly:

```jsx
href="#credentials"
```

must point to:

```jsx
id="credentials"
```

### Images do not load

For files in `frontend/public/`, use a root path:

```jsx
src="/logo.jpeg"
```

Do not use `src="frontend/public/logo.jpeg"` in browser JSX.

### A form fails

Check that the backend is running, `frontend/.env` has the correct URL, and the frontend field names match the backend model.

### Changes do not appear

Refresh the page, confirm the correct file was edited, and restart `yarn start` if the development server is showing an old build.

## 18. One-line reference

If you want to edit a visible website section, start here:

```text
frontend/src/components/site/
```

If you want to change where sections appear, edit:

```text
frontend/src/App.js
```

If you want to change the entire site's design language, edit:

```text
frontend/src/index.css
frontend/tailwind.config.js
```

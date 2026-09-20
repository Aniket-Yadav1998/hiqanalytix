# HIQAnalytix Frontend Project Guide

## Project Technology Stack

- **React 19** - UI library
- **React Router DOM 7** - Page routing
- **Redax / TanStack Query** - Data fetching and state management
- **Tailwind CSS 3** - Styling framework
- **Framer Motion** - Animations and transitions
- **Phosphor Icons** - Icon set
- **Recharts** - Chart visualizations
- **Sonner** - Toast notifications
- **Axios** - API calls
- **React Hook Form** - Form handling
- **DayJS** - Date handling

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── site/           # Page sections
│   │   ├── About.jsx
│   │   ├── AnalyticsFlow.jsx
│   │   ├── CaseStudies.jsx
│   │   ├── Contact.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Industries.jsx
│   │   ├── Insights.jsx
│   │   ├── Navbar.jsx
│   │   ├── RoiCalculator.jsx
│   │   ├── Services.jsx
│   │   ├── TechStack.jsx
│   │   └──...
│   └── ui/             # Generic UI components (buttons, inputs, etc.)
├── constants/          # Constants and test IDs
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── App.js              # Main component - registers all pages
└── index.js            # Entry point
```

## Page Structure (App.js)

The app consists of these pages in order:
1. **Navbar** - Top navigation
2. **Hero** - Main headline section with rotating services
3. **About** - Company information
4. **Services** - Five practice areas
5. **AnalyticsFlow** - Automation flow chart
6. **TechStack** - Technologies used
7. **CaseStudies** - Project examples
8. **RoiCalculator** - ROI estimation tool
9. **Industries** - Industry focus areas
10. **Insights** - Blog/insights
11. **Contact** - Contact form
12. **Footer** - Bottom section

## How to Edit Specific Sections

### 1. Header / Navbar

**File:** `src/components/site/Navbar.jsx`

**What it contains:**
- Navigation links (Home, About, Services, etc.)
- Mobile menu toggle
- Contact info dropdown

**To edit:**
- Change link text in the `<nav>` section
- Modify link URLs (href values)
- Add/remove navigation items
- Change breakpoint for mobile menu ( Tailwind classes like `lg:col-span-7` )

### 2. Hero Section

**File:** `src/components/site/Hero.jsx`

**What it contains:**
- Rotating service lines ("Power BI dashboards", "Power Automate flows", etc.)
- Trust ribbons (certifications badges)
- Metrics cards (5 industries, 40+ dashboards, 99.9% uptime, 24/7 support)
- Background animations and glowing effects

**To edit:**
- **Rotate services:** Edit the `rotators` array on line 6-12
- **Trust ribbons:** Edit the array on lines 135-145 (add/remove certifications)
- **Metrics:** Edit the array on lines 152-157 (change numbers and labels)
- **Background animations:** Modify the motion.span effects

### 3. Footer

**File:** `src/components/site/Footer.jsx`

**What it contains:**
- Company links
- Quick links
- Social media or contact info

**To edit:**
- Modify the link lists in the footer grid
- Change copyright text at the bottom
- Add/remove social media icons

### 4. About Section

**File:** `src/components/site/About.jsx`

**What it contains:**
- Team image
- Company description text
- Feature bullets (specialisation, governance, outcome-based)
- ISO 27001 badge overlay

**To edit:**
- **Image:** Change the `aboutImg` variable (line 5) to a new Unsplash image URL
- **Description:** Edit the `bullets` array (lines 7-12)
- **ISO badge:** Modify the text on line 37 (`ISO 27001`)

### 5. Services Section

**File:** `src/components/site/Services.jsx`

**What it contains:**
- 5 service cards: Power Platform, Power BI, Business Automation, RPA, Agentic AI
- Each card has icon, title, tagline, and description bullets

**To edit:**
- **Add new service:** Add a new object to the `services` array (lines 5-51)
- **Edit existing:** Modify the `key`, `title`, `tagline`, `body`, and `bullets` fields
- **Change layout:** Modify the `span` property on each service object

### 6. ROI Calculator

**File:** `src/components/site/RoiCalculator.jsx`

**What it contains:**
- Form to input company details (name, email, industry, team size, hours/week, tools)
- Calculates projected savings
- Displays animated results with charts

**To edit:**
- **Form fields:** Edit the `initial` object (lines 13-21) to add/remove fields
- **Industries list:** Edit the `industries` array (line 11)
- **Calculation logic:** Modify the `onSubmit` function (lines 54-83)
- **Result display:** Edit the `RoiResult` function (lines 193-439)

### 7. Insights Section

**File:** `src/components/site/Insights.jsx`

**Check current content** - may vary. Typically contains:
- Blog posts or insights articles
- Cards with titles, dates, and excerpts

**To edit:**
- Add/remove insight cards
- Change titles and descriptions
- Modify the grid layout

### 8. Contact Section

**File:** `src/components/site/Contact.jsx`

**What it contains:**
- Contact form (name, email, phone, industry, message)
- Contact info (email address, remote-first statement)
- Submit button with form validation

**To edit:**
- **Form fields:** Edit the `initial` object and `field` function
- **Submit action:** Modify the `onSubmit` function (sends data to API)
- **Contact info:** Change the email link and address text
- **Validation:** Edit the `validate` function

### 9. Add New PDF Certificate Section (like Startup India)

If you want to add a new downloadable certificate section:

**Step 1:** Place PDF file in `public/` folder
- Example: `public/startup-india-certificate.pdf`

**Step 2:** Create new component (e.g., `StartupIndiaCertificate.jsx`)
- Reference the PDF path: `const pdfPath = "/startup-india-certificate.pdf";`
- Add download button with `href={pdfPath}`
- Add visual placeholder area

**Step 3:** Register the section in `App.js`
- Import the component: `import StartupIndiaCertificate from "@/components/site/StartupIndiaCertificate";`
- Add to the main layout: `<StartupIndiaCertificate />`

**Step 4:** Style it to match existing design
- Use same Tailwind classes as other sections
- Match button styles (bg-brand, text-white, etc.)
- Use same motion animations for consistency

## How to Run the Project

```bash
# Install dependencies
npm install   # or yarn

# Start development server
npm start     # or yarn start

# Build for production
npm build     # or yarn build
```

## Key Configuration Files

- **package.json** - Dependencies and scripts
- **tailwind.config.js** - Tailwind customization (colors, fonts)
- **craco.config.js** - Create React App Configuration Override
- **postcss.config.js** - PostCSS processing
- **eslint.config.js** - Code linting rules

## Adding New Pages

1. Create new component in `src/components/site/`
2. Add import to `src/App.js`
3. Add `<NewPage />` in the main layout (after Navbar, before main closing tag)
4. Add any necessary CSS/Tailwind classes

## Making Safe Changes

1. **Always restart the dev server** after code changes (`Ctrl+C`, then `npm start`)
2. **Check the console** for compilation errors
3. **Test on mobile** - the site uses responsive design (lg: prefixes)
4. **Keep Tailwind classes consistent** with existing design patterns
5. **Test form submissions** to ensure API calls work

## Common Tailwind Patterns Used

- `flex` / `inline-flex` - Layout
- `grid` - Grid layout
- `md:`, `lg:` - Responsive breakpoints
- `bg-brand` / `text-brand` - Primary brand colors (usually green: #48A14D)
- `shadow-lg` / `shadow-sm` - Box shadows
- `transition-colors` - Hover transitions
- `group-hover:` - Hover on parent affecting children
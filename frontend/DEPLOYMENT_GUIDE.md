# HIQAnalytix Frontend - Production Deployment Guide

## Overview
- **Frontend**: React 19 (Create React App + CRACO) - Static SPA
- **Backend**: Separate Node.js/Express API (deploy separately)
- **Database**: PostgreSQL/MySQL (managed cloud recommended)
- **Hosting**: GoDaddy cPanel Linux Hosting + Cloudflare (recommended)

---

## Architecture
```
┌─────────────────┐     HTTPS      ┌─────────────────┐     Internal      ┌─────────────────┐
│   User Browser  │ ──────────────▶ │  Cloudflare CDN │ ────────────────▶ │  GoDaddy cPanel │
│  (yourdomain.com)│ ◀─────────────  │  (WAF, SSL,     │ ◀──────────────  │  (Static Files) │
└─────────────────┘    Static Files  │   Cache, DDoS)  │   Static Files   └─────────────────┘
                                      └────────┬────────┘
                                               │ API Calls
                                               ▼
                                      ┌─────────────────┐     Internal      ┌─────────────────┐
                                      │  Backend API    │ ────────────────▶ │   Database      │
                                      │  (VPS/Cloud)    │ ◀──────────────  │  (Managed DB)   │
                                      └─────────────────┘                   └─────────────────┘
```

---

## Prerequisites
- GoDaddy **cPanel Linux Hosting** (Deluxe/Ultimate or VPS)
- Domain registered (GoDaddy or elsewhere)
- Backend API deployed separately (VPS, Railway, Render, AWS, etc.)
- Database provisioned (Neon, Supabase, PlanetScale, AWS RDS, etc.)

---

## Step 1: Prepare Production Build

### 1.1 Create Production Environment File
```bash
cd C:\Users\andyy\Code\hiqanalytix\frontend
cp .env.production.template .env.production
# Edit .env.production with your actual values
```

### 1.2 Update package.json homepage (optional but recommended)
```json
"homepage": "https://yourdomain.com"
```

### 1.3 Build
```bash
npm run build
```
→ Creates `build/` folder with production assets

---

## Step 2: Backend API Deployment (Required for Forms)

### Option A: VPS (DigitalOcean, Linode, Vultr, Hetzner)
```bash
# On your VPS
git clone <your-backend-repo>
cd backend
npm ci --production
# Configure PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Managed Platform (Railway, Render, Fly.io)
- Connect GitHub repo
- Set environment variables
- Auto-deploys on push

### Option C: GoDaddy VPS
- Similar to Option A but on GoDaddy infrastructure

### Backend Requirements
- Node.js 18+
- PostgreSQL/MySQL connection
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://yourdomain.com`
- SSL certificate (Let's Encrypt via Nginx/Caddy)

---

## Step 3: Database Setup

### Recommended: Managed PostgreSQL
| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Neon** | 0.5 GB | Serverless, branches, autoscaling |
| **Supabase** | 500 MB | Includes Auth, Realtime, Storage |
| **PlanetScale** | 1 GB | MySQL-compatible, branching |
| **AWS RDS** | 12 months free | Production-grade |
| **Railway** | $5 credit | Simple, integrated |

### Database Schema (Contact Form)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(2) NOT NULL,
    phone VARCHAR(50),
    telephone VARCHAR(50),
    industry VARCHAR(100),
    message TEXT NOT NULL,
    form_started_at BIGINT,
    human_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

### Newsletter Table (if using Insights subscribe)
```sql
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50), -- 'footer', 'insights', 'contact'
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 4: DNS Configuration

### 4.1 If Domain on GoDaddy
1. GoDaddy → **My Products** → **Domains** → **DNS**
2. Add records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | [GoDaddy Hosting IP] | 600 |
| A | www | [GoDaddy Hosting IP] | 600 |
| CNAME | api | [Backend Domain/IP] | 3600 |
| TXT | @ | "v=spf1 include:_spf.google.com ~all" | 3600 |
| TXT | _dmarc | "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com" | 3600 |

### 4.2 Recommended: Cloudflare (Free Tier)
1. Sign up at cloudflare.com → Add site
2. Change nameservers at registrar to Cloudflare's
3. DNS Records in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | [GoDaddy Hosting IP] | ✅ Proxied |
| A | www | [GoDaddy Hosting IP] | ✅ Proxied |
| A/CNAME | api | [Backend IP/Domain] | ✅ Proxied |
| TXT | @ | SPF record | DNS Only |
| TXT | _dmarc | DMARC record | DNS Only |

4. **SSL/TLS** → **Full (Strict)**
5. **Speed** → **Auto Minify** (CSS, JS, HTML) ON
6. **Caching** → **Cache Level: Standard**, **Browser Cache TTL: 1 year**
7. **WAF** → Enable **OWASP Managed Rules**
8. **Page Rules** (3 free):
   - `yourdomain.com/*` → **Cache Level: Standard**, **Edge Cache TTL: 1 month**
   - `yourdomain.com/api/*` → **Cache Level: Bypass**
   - `yourdomain.com/*.php*` → **Security Level: High**

---

## Step 5: GoDaddy cPanel Upload

### 5.1 File Manager Method
1. cPanel → **File Manager** → `public_html`
2. **Select All → Delete** (backup first if needed)
3. **Upload** → Select all files from local `build/` folder
4. Ensure `.htaccess` is uploaded (hidden file - enable "Show Hidden Files")

### 5.2 FTP/SFTP Method (Faster for large sites)
```bash
# Using FileZilla or WinSCP
Host: ftp.yourdomain.com (or server IP)
User: cPanel username
Pass: cPanel password
Port: 21 (FTP) or 22 (SFTP)

Local: C:\Users\andyy\Code\hiqanalytix\frontend\build\
Remote: /public_html/
# Transfer all files
```

### 5.3 Verify Structure
```
public_html/
├── .htaccess
├── index.html
├── asset-manifest.json
├── favicon.ico (if exists)
├── logo-transparent.png
├── logo.jpeg
├── og-cover.png
├── robots.txt
├── sitemap.xml
├── startup-india-certificate.pdf
└── static/
    ├── css/
    │   └── main.[hash].css
    ├── js/
    │   └── main.[hash].js
    └── media/
        └── ...
```

---

## Step 6: SSL/HTTPS Setup

### 6.1 GoDaddy cPanel SSL
1. cPanel → **SSL/TLS Status**
2. Select domain → **Run AutoSSL**
3. Wait for "Valid" status (green lock)

### 6.2 Force HTTPS
1. cPanel → **Domains** → Toggle **Force HTTPS Redirect** ON
2. Or in `.htaccess` (already included):
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 6.3 Cloudflare SSL (if using)
- SSL/TLS → **Full (Strict)**
- Edge Certificates → **Always Use HTTPS** ON
- **Automatic HTTPS Rewrites** ON

---

## Step 7: Security Hardening

### 7.1 Security Headers (in .htaccess - already added)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security` (enable after SSL verified)

### 7.2 Content Security Policy (Add to index.html `<head>`)
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com;
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src 'self' data: https://fonts.gstatic.com;
           img-src 'self' data: https:;
           connect-src 'self' https://api.yourdomain.com https://www.google-analytics.com;
           frame-ancestors 'none';
           base-uri 'self';
           form-action 'self' https://api.yourdomain.com;">
```

### 7.3 Backend CORS Configuration
```javascript
// backend/cors.js
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
```

---

## Step 8: Environment Variables

### Frontend (.env.production)
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_GA_ID=G-XXXXXXXXXX
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=your-256-bit-secret-here
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## Step 9: Email Delivery (Contact Form)

### Option: SendGrid / Mailgun / Resend / AWS SES
1. Verify domain (SPF, DKIM, DMARC)
2. Create API key
3. Add to backend `.env`
4. Test contact form submission

---

## Step 10: Monitoring & Analytics

### 10.1 Google Analytics 4
- Add `REACT_APP_GA_ID` to `.env.production`
- Rebuild and redeploy

### 10.2 Uptime Monitoring
- **UptimeRobot** (free): Monitor `https://yourdomain.com` + `https://api.yourdomain.com/health`
- **Better Stack** / **Pingdom** / **Datadog**

### 10.3 Error Tracking
- **Sentry** (free tier): Add to frontend + backend
- **LogRocket** for session replay

---

## Step 11: Backup Strategy

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily (auto) | 30 days |
| Backend Code | On deploy | Git history |
| Frontend Build | On deploy | Git history |
| cPanel Files | Weekly | 4 weeks |
| SSL Certs | Auto-renew | N/A |

---

## Step 12: Go-Live Checklist

- [ ] Domain DNS propagated (check: `dig yourdomain.com +short`)
- [ ] SSL certificate valid (check: `https://www.ssllabs.com/ssltest/`)
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] All routes work: `/#contact`, `/#services`, `/#insights`
- [ ] Contact form submits → check backend logs + email received
- [ ] Newsletter subscribe works (Footer + Insights)
- [ ] ROI Calculator functions
- [ ] Mobile responsive test
- [ ] PageSpeed Insights > 90
- [ ] Security headers present (check: `securityheaders.com`)
- [ ] CSP not blocking resources (check Console)
- [ ] Backend health endpoint: `https://api.yourdomain.com/health`
- [ ] Database backups configured
- [ ] Monitoring alerts configured
- [ ] Error tracking receiving test errors

---

## Rollback Plan

```bash
# If deployment breaks:
# 1. Keep previous build folder locally
# 2. Re-upload previous build/ to public_html via FTP
# 3. Or in cPanel: restore from backup (if enabled)

# For backend:
pm2 restart all --update-env
# Or deploy previous Git tag
```

---

## Cost Estimate (Monthly)

| Component | Estimate |
|-----------|----------|
| GoDaddy cPanel Hosting | $5-15/mo |
| Domain | $12-20/yr |
| Backend VPS (2GB RAM) | $4-12/mo |
| Managed PostgreSQL | $0-20/mo |
| Email (SendGrid) | $0-15/mo |
| Cloudflare | Free |
| Monitoring | Free |
| **Total** | **~$15-50/mo** |

---

## Support Contacts

- **GoDaddy Support**: 24/7 chat/phone
- **Cloudflare Community**: community.cloudflare.com
- **Database Provider**: Their support channels
- **This Project**: Check `GUIDE.md` for code structure

---

## File Structure Reference (Preserved)
```
hiqanalytix/
├── frontend/                    # React App (this folder)
│   ├── build/                   # Production output (upload this)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── brand/               # Brand constants (colors, typography, logo)
│   │   ├── components/
│   │   │   ├── site/            # Page sections
│   │   │   └── ui/              # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities
│   │   ├── App.js               # Main app (registers sections)
│   │   └── index.js             # Entry point
│   ├── .htaccess                # SPA routing + security (in build/)
│   ├── .env.production          # Production env vars
│   ├── package.json
│   └── DEPLOYMENT_GUIDE.md      # This file
└── backend/                     # Separate repository
    ├── src/
    ├── package.json
    └── ecosystem.config.js      # PM2 config
```

---

## Next Steps After Launch

1. **Week 1**: Monitor errors, analytics, form submissions daily
2. **Month 1**: Review PageSpeed, optimize images/bundle if needed
3. **Ongoing**: 
   - Dependency updates (`npm audit`, `npm update`)
   - SSL renewal (auto via Let's Encrypt)
   - Database maintenance (vacuum, analyze)
   - Content updates via code deploy

---

**Need help with specific step?** Reference the relevant section above or check:
- `GUIDE.md` for codebase structure
- `src/brand/` for design tokens
- Component files in `src/components/site/` for content edits
# Release Branch & Future Deployment Workflow

## Git Branching Strategy

```
main (protected) ←─── release/v1.x.x ←─── develop ←─── feature/*
     ↑                    ↑                  ↑
  Production           Staging           Integration
```

---

## One-Time Setup (First Time Only)

### 1. Initialize Git & Push to GitHub
```bash
cd C:\Users\andyy\Code\hiqanalytix\frontend

# Initialize if not already
git init
git add .
git commit -m "Initial commit: HIQAnalytix frontend"

# Create GitHub repo (via GitHub CLI or web)
gh repo create hiqanalytix-frontend --private --source=. --push

# Or manually:
# 1. Create repo at github.com
# 2. git remote add origin https://github.com/yourusername/hiqanalytix-frontend.git
# 3. git push -u origin main
```

### 2. Create Branch Protection Rules (GitHub Web UI)
**Settings → Branches → Add rule for `main`:**
- ✅ Require pull request reviews (1+)
- ✅ Require status checks to pass (build, test)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes to matching branches

**Add rule for `release/*`:**
- ✅ Require status checks
- ✅ Restrict pushes

### 3. Create `develop` Branch
```bash
git checkout -b develop
git push -u origin develop
```

### 4. Create First Release Branch
```bash
git checkout -b release/v1.0.0 develop
git push -u origin release/v1.0.0
```

### 5. GitHub Environments (Settings → Environments)
Create 3 environments:
| Environment | Protection Rules | Secrets |
|-------------|------------------|---------|
| `development` | None | `FTP_HOST_DEV`, `FTP_USER_DEV`, `FTP_PASS_DEV` |
| `staging` | Required reviewers (1) | `FTP_HOST_STAGING`, `FTP_USER_STAGING`, `FTP_PASS_STAGING` |
| `production` | Required reviewers (2), Wait timer (5 min) | `FTP_HOST_PROD`, `FTP_USER_PROD`, `FTP_PASS_PROD`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` |

---

## GitHub Secrets Required

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Used By |
|-------------|-------|---------|
| `FTP_HOST_DEV` | ftp.dev.yourdomain.com | Deploy to dev |
| `FTP_USER_DEV` | cPanel username | Deploy to dev |
| `FTP_PASS_DEV` | cPanel password | Deploy to dev |
| `FTP_HOST_STAGING` | ftp.staging.yourdomain.com | Deploy to staging |
| `FTP_USER_STAGING` | cPanel username | Deploy to staging |
| `FTP_PASS_STAGING` | cPanel password | Deploy to staging |
| `FTP_HOST_PROD` | ftp.yourdomain.com | Deploy to prod |
| `FTP_USER_PROD` | cPanel username | Deploy to prod |
| `FTP_PASS_PROD` | cPanel password | Deploy to prod |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Zone:Read, DNS:Edit) | Purge cache |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | Purge cache |
| `SLACK_WEBHOOK_URL` | (Optional) Slack webhook | Notifications |

---

## Future Deployment Workflow

### Daily Development
```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/contact-form-validation

# 2. Work, commit, push
git add .
git commit -m "feat: add mobile number validation"
git push -u origin feature/contact-form-validation

# 3. Create PR to develop
gh pr create --base develop --title "Add mobile validation" --body "Closes #123"

# 4. After review & CI passes → Merge to develop
gh pr merge --squash --delete-branch
```

### Release Process (Every Sprint/Release)

#### 1. Create Release Branch from `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0
git push -u origin release/v1.1.0
```

#### 2. Release Branch CI Runs Automatically
- Builds & tests
- Deploys to **staging** environment
- Creates GitHub Release (draft)

#### 3. QA on Staging
- Test at `https://staging.yourdomain.com`
- Verify all forms, routes, API calls
- Fix bugs via commits to `release/v1.1.0`

#### 4. Prepare Release Notes
```bash
# Auto-generate from conventional commits
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
# Or use GitHub's "Generate release notes"
```

#### 5. Merge to `main` (Production Deploy)
```bash
# Option A: GitHub Web UI (recommended)
# Go to PR: release/v1.1.0 → main
# Add release notes → Merge (squash)

# Option B: CLI
git checkout main
git pull origin main
git merge --no-ff release/v1.1.0 -m "Release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

#### 6. Automatic Production Deploy
- GitHub Actions triggers on `main` push + tag
- Builds → Deploys to production
- Purges Cloudflare cache
- Posts to Slack

#### 7. Backport to `develop`
```bash
git checkout develop
git merge --no-ff main -m "chore: backport release v1.1.0"
git push origin develop
```

#### 8. Cleanup
```bash
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

---

## Hotfix Process (Urgent Production Fix)

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/v1.1.1

# 2. Fix, test, commit
git add .
git commit -m "fix: prevent XSS in contact form"

# 3. PR to main (bypass develop)
gh pr create --base main --title "Hotfix: XSS prevention"

# 4. Merge to main → Auto deploys to prod

# 5. Backport to develop
git checkout develop
git merge --no-ff hotfix/v1.1.1
git push origin develop

# 6. Cleanup
git branch -d hotfix/v1.1.1
git push origin --delete hotfix/v1.1.1
```

---

## GitHub Actions Workflows

### `.github/workflows/ci.yml` (Every Push/PR)
```yaml
name: CI
on:
  push:
    branches: [main, develop, 'release/**', 'hotfix/**']
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test --if-present -- --watchAll=false
      - run: npm run lint --if-present
```

### `.github/workflows/deploy-staging.yml` (Release Branch)
```yaml
name: Deploy Staging
on:
  push:
    branches: ['release/**']
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST_STAGING }}
          username: ${{ secrets.FTP_USER_STAGING }}
          password: ${{ secrets.FTP_PASS_STAGING }}
          local-dir: ./build/
          server-dir: /public_html/
      - name: Purge Cloudflare Cache
        if: env.CLOUDFLARE_API_TOKEN
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"purge_everything":true}'
```

### `.github/workflows/deploy-production.yml` (Main + Tags)
```yaml
name: Deploy Production
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST_PROD }}
          username: ${{ secrets.FTP_USER_PROD }}
          password: ${{ secrets.FTP_PASS_PROD }}
          local-dir: ./build/
          server-dir: /public_html/
      - name: Purge Cloudflare Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"purge_everything":true}'
      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
      - name: Notify Slack
        if: env.SLACK_WEBHOOK_URL
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 Deployed ${{ github.ref_name }} to production"}' \
            ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Versioning Convention

Use **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

| Type | Version Bump | Example |
|------|-------------|---------|
| Breaking change | MAJOR | `1.0.0` → `2.0.0` |
| New feature | MINOR | `1.0.0` → `1.1.0` |
| Bug fix | PATCH | `1.0.0` → `1.0.1` |
| Hotfix | PATCH | `1.1.0` → `1.1.1` |

### Commit Message Format (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `perf` | Performance |
| `test` | Tests |
| `chore` | Maintenance |
| `ci` | CI/CD changes |

**Examples:**
```
feat(contact): add mobile number validation
fix(hero): prevent layout shift on mobile
chore(deps): update react to 19.0.0
```

---

## Quick Reference Commands

```bash
# Start new feature
git checkout develop && git pull && git checkout -b feature/xxx

# Start release
git checkout develop && git pull && git checkout -b release/v1.x.x && git push -u origin release/v1.x.x

# Hotfix
git checkout main && git pull && git checkout -b hotfix/v1.x.x

# Merge release to main (via GitHub PR)
# After merge:
git checkout develop && git pull origin main && git push

# View current version
git describe --tags --always

# List all releases
git tag -l "v*" --sort=-v:refname
```

---

## File Structure for CI/CD
```
hiqanalytix/
├── frontend/
│   ├── .github/
│   │   └── workflows/
│   │       ├── ci.yml
│   │       ├── deploy-staging.yml
│   │       └── deploy-production.yml
│   ├── .env.production.template
│   ├── .htaccess (in build/)
│   ├── DEPLOYMENT_GUIDE.md
│   ├── RELEASE_WORKFLOW.md (this file)
│   └── ...
└── backend/ (separate repo)
    └── .github/workflows/...
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| FTP deploy fails | Check credentials, passive mode, firewall |
| Cloudflare cache not purging | Verify API token permissions (Zone:Read, Cache:Purge) |
| Build fails on CI | Check Node version matches local (20.x) |
| `main` merge blocked | Ensure all status checks pass, required reviews met |
| Release branch stale | Delete and recreate from latest `develop` |

---

## Rollback Commands

```bash
# Quick rollback to previous tag
git checkout main
git revert HEAD  # Reverts last merge commit
git push origin main

# Or deploy previous build manually
# 1. Download previous build artifact from GitHub Actions
# 2. Upload via FTP to public_html

# Or checkout previous tag and rebuild
git checkout v1.0.0
npm run build
# Deploy build/ folder
```

---

## Security Notes

- ✅ Never commit `.env.production` or secrets
- ✅ Use GitHub Environments for production approvals
- ✅ Rotate FTP passwords quarterly
- ✅ Use Cloudflare API tokens (not global keys)
- ✅ Enable 2FA on GitHub accounts
- ✅ Review dependabot alerts weekly
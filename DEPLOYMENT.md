# ConsoleCV - Deployment Guide

This guide walks you through deploying ConsoleCV to Vercel for production.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- Your project pushed to GitHub
- Access to your environment variable values

---

## Step 1: Push to GitHub

Before deploying, ensure your latest changes are committed and pushed:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Final production touches - AI parser, save button, mobile fixes, SEO"

# Push to your main branch
git push origin main
```

---

## Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository (`chirag-says/consoleCV`)
4. Vercel will auto-detect it as a Next.js project

---

## Step 3: Configure Environment Variables

In the Vercel project settings, navigate to **Settings** → **Environment Variables** and add:

| Variable Name              | Description                                     | Example Value                                    |
|----------------------------|-------------------------------------------------|--------------------------------------------------|
| `MONGODB_URI`              | MongoDB connection string                       | `mongodb+srv://user:pass@cluster.mongodb.net/consolecv` |
| `AUTH_SECRET`              | NextAuth.js secret (min 32 chars)               | `your-random-secret-key-at-least-32-characters`  |
| `GITHUB_PAT_ENCRYPTION_KEY`| Encryption key for GitHub PAT storage           | `your-encryption-key-32-chars`                   |
| `GROQ_API_KEY`             | Groq API key for AI features                    | `gsk_your_groq_api_key`                          |
| `AUTH_TRUST_HOST`          | Trust Vercel's proxy (Required)                 | `true`                                           |
| `NEXTAUTH_URL`             | Your production URL                             | `https://consolecv.vercel.app`                   |
| `GITHUB_ID` (optional)     | GitHub OAuth App Client ID                      | `Ov23li...`                                      |
| `GITHUB_SECRET` (optional) | GitHub OAuth App Client Secret                  | `github_oauth_secret`                            |

### How to get these values:

- **MONGODB_URI**: From [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers
- **AUTH_SECRET**: Generate with `openssl rand -base64 32`
- **GROQ_API_KEY**: From [console.groq.com](https://console.groq.com/keys) (free)
- **GITHUB_ID/SECRET**: From GitHub Developer Settings → OAuth Apps

> ⚠️ **Important**: Set all environment variables for **Production**, **Preview**, and **Development** environments.

---

## Step 4: Build & Output Settings

Vercel auto-detects Next.js settings, but verify these if needed:

| Setting          | Value           |
|------------------|-----------------|
| Framework Preset | Next.js         |
| Build Command    | `npm run build` |
| Output Directory | `.next`         |
| Install Command  | `npm install`   |
| Node.js Version  | 18.x or 20.x    |

### If you encounter Node.js issues:

1. Go to **Settings** → **General**
2. Scroll to **Node.js Version**
3. Select **20.x** (recommended) or **18.x**

---

## Step 5: Deploy

1. Click **"Deploy"** on the import page
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## Step 6: Connect Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `consolecv.com`)
3. Follow Vercel's DNS instructions:
   - Add a **CNAME** record pointing to `cname.vercel-dns.com`
   - Or add an **A** record pointing to `76.76.21.21`
4. Wait for DNS propagation (up to 48 hours, usually minutes)
5. SSL certificate is automatically provisioned

---

## 5. Post-Deployment Checklist

- [ ] **Verify Authentication**: Try logging in with GitHub and Credentials.
- [ ] **Test Database**: Create a new resume to verify MongoDB write access.
- [ ] **Check Mobile View**: Ensure the dashboard looks good on your phone.
- [ ] **Test Sharing**: Send your public profile link to a friend (e.g., `https://your-app.vercel.app/username`).

## 6. Troubleshooting Common Issues

### "My friends can't create an account" (MongoDB Connection Error)
If sign-up works locally but fails on Vercel, it is 99% likely a **Network Access** issue in MongoDB Atlas.

**The Fix:**
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Select **Allow Access from Anywhere** (0.0.0.0/0).
5. Click **Confirm**.
   - *Reason: Vercel uses dynamic IP addresses, so you cannot whitelist a single IP. You must allow all connections.*

### 500 Internal Server Error
Check your Vercel Logs:
1. Go to your Vercel Dashboard -> Project -> **Logs**.
2. Look for red error messages.
3. Common errors:
   - `MongooseServerSelectionError`: See the MongoDB fix above.
   - `Missing secret`: You forgot to add `AUTH_SECRET` to Vercel Environment Variables.

### Redirects towards localhost
If you are redirected to `localhost:3000` after login on the deployed site:
1. Check Vercel Environment Variables.
2. Ensure `NEXTAUTH_URL` is set to your Vercel domain (e.g., `https://console-cv.vercel.app`), NOT `http://localhost:3000`.
- [ ] Test portfolio on mobile devices
- [ ] Verify SEO meta tags with [metatags.io](https://metatags.io)

---


### Build Fails

```bash
# Check build locally first
npm run build
```

Common issues:
- TypeScript errors: Fix any type errors in your code
- Missing dependencies: Ensure all imports have corresponding packages
- Environment variables: Some features may require env vars at build time

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (for Vercel's dynamic IPs)
- Check cluster status in MongoDB Atlas dashboard

### API Routes Return 500 Errors

- Check Vercel function logs: **Deployments** → Select deployment → **Functions**
- Verify all environment variables are set correctly
- Ensure database connection is working

### Portfolio Page Not Loading Themes

- Check browser console for JavaScript errors
- Verify the resume has `isPublic: true` set
- Ensure `personal.github` field matches the URL username

---

## Monitoring & Analytics

### Vercel Analytics (Optional)

1. Go to project **Analytics** tab
2. Enable Web Analytics for traffic insights
3. Enable Speed Insights for Core Web Vitals

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io) for error monitoring
- [Vercel Logs](https://vercel.com/docs/observability/build-output) for deployment logs

---

## Useful Commands

```bash
# Local development
npm run dev

# Production build test
npm run build && npm start

# Type checking
npx tsc --noEmit

# Lint check
npm run lint
```

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **MongoDB Atlas**: [mongodb.com/docs/atlas](https://www.mongodb.com/docs/atlas/)
- **Groq API**: [console.groq.com/docs](https://console.groq.com/docs)

---

Happy deploying! 🚀

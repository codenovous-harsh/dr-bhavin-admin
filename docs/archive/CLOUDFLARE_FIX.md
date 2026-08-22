# Fix Cloudflare Pages Deployment

## Current Issue

The deployment is failing with:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## Root Cause

Your Cloudflare Pages project has the wrong deploy command configured. It's using `wrangler deploy` (for Cloudflare Workers) instead of `wrangler pages deploy` (for Cloudflare Pages).

## Solution: Update Cloudflare Pages Dashboard

### Step 1: Go to Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → Your project name
3. Click **Settings** → **Builds & deployments**

### Step 2: Update Build Configuration

Change these settings:

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
.vercel/output/static
```

**Deploy command:** (This is the key fix!)
```bash
wrangler pages deploy .vercel/output/static
```

Or simply **remove/clear** the deploy command field and let Cloudflare handle it automatically.

### Step 3: Update Environment Variables

Add these environment variables (if not already set):

- `NEXT_PUBLIC_API_URL` = `https://bhavin-garara-backend-e0trpqxpg2818.cpln.app/api`
- `NODE_VERSION` = `22.22.0`
- Any other variables from your `.env.local` file

### Step 4: Save and Redeploy

1. Click **Save**
2. Go to **Deployments** tab
3. Click **Retry deployment** on the latest failed deployment

## Alternative: Remove Deploy Command Entirely

The simplest fix is to **remove the custom deploy command** entirely:

1. In Cloudflare Pages settings
2. Find the "Deploy command" field
3. **Delete/clear** the value
4. Save

Cloudflare Pages will automatically deploy the build output directory.

## What Changed in Your Code

I've already updated your local files:

1. ✅ Added `@cloudflare/next-on-pages` to package.json
2. ✅ Updated build script to run Next.js + Cloudflare adapter
3. ✅ Created proper wrangler.toml configuration
4. ✅ Fixed all TypeScript build errors
5. ✅ Added deployment documentation

The build will work once you update the Cloudflare dashboard settings.

## Expected Result

After fixing the deploy command, you should see:
```
✓ Compiled successfully
✓ Generating static pages
✓ Build command completed
✓ Deploying to Cloudflare Pages...
✓ Deployment complete!
```

## Need Help?

If the issue persists, check:
- Cloudflare Pages logs for specific errors
- That `@cloudflare/next-on-pages` is installed (it is now)
- That the build output exists in `.vercel/output/static`

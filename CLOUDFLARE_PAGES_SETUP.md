# Cloudflare Pages Setup for Next.js

## Current Situation

Your deployment is showing it's a **Pages project** but trying to use the Workers deploy command (`wrangler deploy`), which is incorrect.

## The Problem

Cloudflare Pages has **automatic Next.js support**, but you need to:
1. Remove the custom deploy command
2. Let Cloudflare Pages handle the deployment automatically

## Solution: Update Your Cloudflare Pages Project Settings

### Step 1: Remove Custom Deploy Command

In your Cloudflare Pages project settings:

1. Go to **Settings** → **Builds & deployments**
2. Find the **Deploy command** field
3. **DELETE/CLEAR** the deploy command entirely
4. Keep only the **Build command**: `npm run build`
5. Set **Build output directory**: `.next`
6. Save

### Step 2: Framework Configuration

Cloudflare Pages should auto-detect Next.js, but if not:

1. Set **Framework preset**: `Next.js`
2. Build command: `npm run build`
3. Build output directory: `.next`
4. Root directory: `/` (leave default)

### Step 3: Environment Variables

Add these in **Settings** → **Environment variables**:

- `NEXT_PUBLIC_API_URL` = `https://bhavin-garara-backend-e0trpqxpg2818.cpln.app/api`
- `NODE_VERSION` = `22`
- Add any other variables from your `.env.local`

### Step 4: Trigger Deployment

1. Push your code to GitHub (with the updated files)
2. Cloudflare Pages will automatically build and deploy
3. No manual `wrangler deploy` needed!

## How Cloudflare Pages Works with Next.js

When you connect a Git repository to Cloudflare Pages:

1. **Auto-detection**: Cloudflare detects it's a Next.js project
2. **Build**: Runs `npm run build` automatically
3. **Deploy**: Handles the deployment automatically
4. **Runtime**: Provides Node.js runtime for SSR features

## What NOT to Do

❌ Don't use `wrangler deploy` (that's for Workers)
❌ Don't use `wrangler pages deploy` manually (Pages auto-deploys)
❌ Don't set a custom deploy command in the dashboard
❌ Don't try to use `@cloudflare/next-on-pages` (deprecated)

## What TO Do

✅ Set build command to `npm run build`
✅ Set output directory to `.next`
✅ Let Cloudflare Pages auto-deploy on Git push
✅ Configure environment variables in the dashboard

## Expected Result

After pushing your code:

```
✓ Cloning repository
✓ Installing dependencies (bun install)
✓ Building project (npm run build)
✓ Deploying to Cloudflare Pages
✓ Deployment successful!
```

Your site will be available at: `https://[project-name].pages.dev`

## Current Files

Your local files are now ready:
- ✅ All TypeScript errors fixed
- ✅ Build script simplified to `npm run build`
- ✅ `wrangler.toml` cleaned up
- ✅ Dependencies updated in `bun.lock`

Just push these changes and remove the deploy command in Cloudflare dashboard!

## Alternative: If Pages Doesn't Support Your Next.js Features

If Cloudflare Pages doesn't support some Next.js feature you're using, deploy to **Vercel** instead:

1. Push to GitHub
2. Import to Vercel
3. Deploy (zero configuration needed)

Vercel has perfect Next.js support since they make Next.js.

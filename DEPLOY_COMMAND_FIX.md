# Deploy Command Fix

## The Issue

Your project is a **Cloudflare Pages** project, but the deploy command is using `wrangler deploy` (which is for Workers).

Error: `It looks like you've run a Workers-specific command in a Pages project.`

## The Fix

Update your CI/CD deploy command from:
```bash
npx wrangler deploy
```

To:
```bash
npx wrangler pages deploy .next
```

## Where to Update

**In your Cloudflare dashboard** (or wherever your CI/CD is configured):

1. Go to your project settings
2. Find the **Deploy command** field
3. Change it to: `wrangler pages deploy .next`
4. Or use: `npm run deploy` (which now runs the correct command)

## What Changed

- ✅ `package.json` deploy script updated to `wrangler pages deploy .next`
- ✅ `wrangler.toml` configured for Pages deployment
- ✅ Build works successfully

## Next Deployment

After updating the deploy command, your deployment will:
```
✓ Build completed (npm run build)
✓ Deploying to Cloudflare Pages (wrangler pages deploy .next)
✓ Success!
```

That's it!

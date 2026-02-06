# Deploying to Cloudflare Workers

This Next.js application is configured to deploy to Cloudflare Workers using `@cloudflare/next-on-pages`.

## Prerequisites

1. Cloudflare account
2. Wrangler CLI installed (it will be installed automatically via npx)
3. Authenticated with Cloudflare: `npx wrangler login`

## Deployment Steps

### 1. Install Dependencies

```bash
bun install
```

This installs `@cloudflare/next-on-pages` and `vercel` (required by the adapter).

### 2. Build for Cloudflare Workers

```bash
npm run build
```

This command:
1. Runs `next build` - creates standard Next.js build
2. Runs `@cloudflare/next-on-pages` - converts it to Cloudflare Workers format

Output will be in `.vercel/output/static/`

### 3. Deploy to Cloudflare Workers

```bash
npm run deploy
```

Or manually:
```bash
npx wrangler deploy
```

### 4. Set Environment Variables

After first deployment, set your environment variables:

```bash
npx wrangler secret put NEXT_PUBLIC_API_URL
```

When prompted, enter: `https://bhavin-garara-backend-e0trpqxpg2818.cpln.app/api`

Add any other environment variables from your `.env.local`:
```bash
npx wrangler secret put VARIABLE_NAME
```

## CI/CD Deployment (GitHub Actions, etc.)

For your CI/CD pipeline, the deploy command should be:

```bash
npx wrangler deploy
```

Make sure these are set in your CI/CD environment:
- `CLOUDFLARE_API_TOKEN` or `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_KEY`

## Configuration Files

- `wrangler.toml` - Cloudflare Workers configuration
- `.node-version` - Node.js version (22.22.0)
- `.nvmrc` - Alternative Node version file

## How It Works

1. **Next.js Build**: `next build` creates the standard build in `.next/`
2. **Cloudflare Adapter**: `@cloudflare/next-on-pages` transforms it for Workers runtime
3. **Worker Entry**: `_worker.js` is generated in `.vercel/output/static/`
4. **Static Assets**: All static files go to `.vercel/output/static/`
5. **Deployment**: Wrangler uploads the worker + static assets

## Troubleshooting

### "Missing entry-point to Worker script"
- Make sure you ran `npm run build` before deploying
- Check that `.vercel/output/static/_worker.js` exists

### "nodejs_compat" errors
- The compatibility flag is set in `wrangler.toml`
- Make sure you're using the latest wrangler version

### Build fails
- Ensure `@cloudflare/next-on-pages` is installed
- Check that all TypeScript errors are fixed (they are now)
- Verify Node.js version is 22.22.0

### Runtime errors
- Check Cloudflare Workers logs: `npx wrangler tail`
- Verify environment variables are set
- Review which Next.js features are supported: https://github.com/cloudflare/next-on-pages

## Important Notes

- ✅ All TypeScript build errors have been fixed
- ✅ `@cloudflare/next-on-pages` adapter configured
- ✅ Worker entry point set to `.vercel/output/static/_worker.js`
- ✅ Static assets configured with `[site]` bucket
- ✅ Node.js compatibility enabled

## Production Deployment

When deploying to production, make sure to:
1. Set all environment variables via `wrangler secret put`
2. Configure custom domain in Cloudflare dashboard
3. Set up CI/CD with proper Cloudflare credentials
4. Monitor via Cloudflare Workers dashboard

## Local Development

To preview the Worker locally:
```bash
npm run preview
```

This runs `wrangler dev` with your built application.

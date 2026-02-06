# Deploying to Cloudflare Pages

This Next.js application uses `@cloudflare/next-on-pages` to deploy to Cloudflare Pages.

## Cloudflare Pages Dashboard Configuration

### Build Settings

Go to your Cloudflare Pages project settings and configure:

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.vercel/output/static`
- **Deploy command**: `wrangler pages deploy .vercel/output/static`
- **Node.js version**: 22.22.0 (automatically detected from `.node-version`)

### Environment Variables

Add these environment variables in Cloudflare Pages settings:
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NODE_VERSION` - 22.22.0
- Any other environment variables from your `.env.local`

## Manual Deployment via CLI

1. Install dependencies:
   ```bash
   bun install
   ```

2. Build for Cloudflare Pages:
   ```bash
   npm run build
   ```
   This runs both `next build` and `@cloudflare/next-on-pages`

3. Deploy:
   ```bash
   npm run deploy
   ```
   Or manually:
   ```bash
   wrangler pages deploy .vercel/output/static --project-name=bhavin-garara-frontend
   ```

## How It Works

1. `next build` creates the standard Next.js build in `.next/`
2. `@cloudflare/next-on-pages` transforms it into Cloudflare-compatible format in `.vercel/output/static/`
3. Wrangler deploys the static output to Cloudflare Pages

## Important Notes

- ✅ Uses `@cloudflare/next-on-pages` for Next.js 16 compatibility
- ✅ Node.js compatibility enabled for server-side features
- ✅ Supports middleware, API routes, and server components
- ⚠️ Make sure to run both build steps (handled automatically by `npm run build`)
- ⚠️ Deploy command must be `wrangler pages deploy` NOT `wrangler deploy`

## Troubleshooting

### Error: "It looks like you've run a Workers-specific command"
- Solution: Use `wrangler pages deploy` instead of `wrangler deploy`
- Update the deploy command in Cloudflare Pages dashboard

### Build fails with module errors
- Ensure `@cloudflare/next-on-pages` is in devDependencies
- Run `bun install` to install it
- Check that `.vercel/output/static` exists after build

### Runtime errors on Cloudflare
- Check that `nodejs_compat` is enabled in wrangler.toml
- Verify all environment variables are set in Cloudflare dashboard
- Review Cloudflare Pages logs for specific errors

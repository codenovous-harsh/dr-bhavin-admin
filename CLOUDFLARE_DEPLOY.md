# Deploying to Cloudflare Pages

This Next.js application requires special configuration to deploy to Cloudflare Pages.

## Option 1: Automatic Cloudflare Pages Deployment (Recommended)

1. Go to Cloudflare Pages dashboard
2. Connect your Git repository
3. Use these build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build && npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Environment variables**: Add your environment variables from `.env.local`

4. Deploy!

## Option 2: Manual Deployment via CLI

1. Install dependencies:
   ```bash
   bun install
   ```

2. Build the application:
   ```bash
   npm run build
   npx @cloudflare/next-on-pages
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy .vercel/output/static --project-name=bhavin-garara-frontend
   ```

## Important Notes

- This project uses `@cloudflare/next-on-pages` to adapt Next.js for Cloudflare's edge runtime
- The output directory is `.vercel/output/static`
- Make sure to set all required environment variables in Cloudflare Pages settings
- Node.js compatibility mode is enabled for features that need it

## Troubleshooting

If deployment fails:
1. Check that `@cloudflare/next-on-pages` is installed
2. Verify the build output exists in `.vercel/output/static`
3. Check Cloudflare Pages logs for specific errors
4. Ensure Node.js compatibility is enabled in wrangler.toml

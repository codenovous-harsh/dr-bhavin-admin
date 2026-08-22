# Deploy to Cloudflare Workers (Not Pages)

## Current Issue

You're trying to use `wrangler deploy` (Workers deployment) but your Next.js app isn't configured for Workers.

## Solution: Install OpenNext Adapter

Since `@cloudflare/next-on-pages` is deprecated, you need to use OpenNext.

### Step 1: Install OpenNext

```bash
bun add -D @opennextjs/cloudflare
```

### Step 2: Update package.json

```json
{
  "scripts": {
    "build": "open-next build --cloudflare",
    "deploy": "wrangler deploy"
  }
}
```

### Step 3: Update wrangler.toml

```toml
name = "bhavin-garara-frontend"
main = ".open-next/worker.js"
compatibility_date = "2026-02-06"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = ".open-next/assets"
```

### Step 4: Build and Deploy

```bash
npm run build
npm run deploy
```

## Important Notes

- OpenNext is in active development
- Some Next.js features may not work
- Requires testing and potential code changes
- More complex than Cloudflare Pages

## Recommended: Use Cloudflare Pages Instead

Cloudflare Pages has **native Next.js support** and requires zero configuration:

1. No adapters needed
2. No build tool configuration
3. Just push code and it works
4. Better DX and reliability

**To switch to Pages:**
1. In Cloudflare dashboard, remove the deploy command
2. Set build command: `npm run build`
3. Let Pages auto-deploy on git push

This is what Cloudflare recommends for Next.js apps.

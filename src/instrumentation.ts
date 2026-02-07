// Sentry disabled for Cloudflare Workers to reduce bundle size
// To re-enable, set NEXT_PUBLIC_SENTRY_DISABLED=false and configure DSN

export async function register() {
  // Sentry instrumentation disabled
  // Uncomment and configure if needed:
  // if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  //   const Sentry = await import('@sentry/nextjs');
  //   if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
  //     Sentry.init({
  //       dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  //       tracesSampleRate: 1,
  //     });
  //   }
  // }
}

export const onRequestError = () => {
  // Sentry disabled
};

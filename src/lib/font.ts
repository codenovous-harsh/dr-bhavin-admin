import { Geist_Mono, Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

/**
 * Two families, both actually used.
 *
 * This previously loaded six (Geist, Geist Mono, Instrument Sans, Noto Sans
 * Mono, Mulish, Inter) while only the sans and mono utilities were ever
 * referenced — four families were downloaded on every page load for nothing.
 *
 * The variable names here are consumed by `@theme inline` in globals.css:
 *   --font-inter      -> --font-sans
 *   --font-geist-mono -> --font-mono
 */
const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono'
});

export const fontVariables = cn(fontSans.variable, fontMono.variable);

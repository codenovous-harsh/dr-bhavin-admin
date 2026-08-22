import { RecentSales } from '@/features/overview/components/recent-sales';

// The template shipped an artificial `await delay(1000..3000)` here to demo
// streaming. RecentSales fetches its own data client-side, so the delay did nothing
// but stall the dashboard on every load.
export default function Sales() {
  return <RecentSales />;
}

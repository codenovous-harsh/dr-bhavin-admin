import { AreaGraph } from '@/features/overview/components/area-graph';

// The template shipped an artificial `await delay(1000..3000)` here to demo
// streaming. AreaGraph fetches its own data client-side, so the delay did nothing
// but stall the dashboard on every load.
export default function AreaStats() {
  return <AreaGraph />;
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Dashboard : Kanban view'
};

export default function page() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feature Temporarily Disabled</CardTitle>
          <CardDescription>
            Kanban board has been temporarily disabled for bundle size optimization.
            This feature will be re-enabled soon with improved performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[400px] bg-muted/20">
          <p className="text-muted-foreground">Kanban board coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

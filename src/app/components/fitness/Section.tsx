import type { ReactNode } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '../ui/card';

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="gap-4">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{title}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
    </Card>
  );
}

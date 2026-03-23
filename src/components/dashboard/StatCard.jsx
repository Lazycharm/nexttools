import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'text-primary' }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-lg bg-primary/5`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
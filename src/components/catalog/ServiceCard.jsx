import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowRight } from 'lucide-react';

const qualityColors = {
  standard: 'bg-secondary text-secondary-foreground',
  premium: 'bg-primary/10 text-primary',
  elite: 'bg-amber-500/10 text-amber-600',
};

export default function ServiceCard({ service }) {
  return (
    <Link to={`/service/${service.id}`}>
      <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="secondary" className="text-xs capitalize">
              {service.category?.replace(/_/g, ' ')}
            </Badge>
            {service.quality_badge && (
              <Badge className={`text-xs ${qualityColors[service.quality_badge]}`}>
                {service.quality_badge}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {service.subtitle}
          </p>
          <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
            {service.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {service.rating}
              </span>
            )}
            {service.delivery_estimate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.delivery_estimate}
              </span>
            )}
            {service.total_orders > 0 && (
              <span>{service.total_orders.toLocaleString()} orders</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground">${service.base_price}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {service.price_type === 'quantity' ? '/1K' : service.price_type === 'duration' ? '/mo' : ''}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
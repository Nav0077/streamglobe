// app/components/StreamPanel/ViewerBadge.tsx

import { formatViewerCount } from '@/lib/markerUtils';
import { Users } from 'lucide-react';

interface ViewerBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ViewerBadge({ count, size = 'md' }: ViewerBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-black/70 backdrop-blur-sm 
                   text-white font-semibold rounded-full ${sizeClasses[size]}`}
    >
      <Users className="w-3 h-3 text-red-400" />
      {formatViewerCount(count)}
    </div>
  );
}

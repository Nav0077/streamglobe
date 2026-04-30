// app/components/UI/StatsBar.tsx

'use client';

import { PlatformStats } from '@/lib/types';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { formatViewerCount } from '@/lib/markerUtils';

interface StatsBarProps {
  stats: PlatformStats[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  const total = stats.reduce((sum, s) => sum + s.totalViewers, 0);

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800/30">
      {stats.map((stat) => {
        const percentage = total > 0 ? (stat.totalViewers / total) * 100 : 0;
        return (
          <div key={stat.platform} className="flex-1 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {PLATFORM_LABELS[stat.platform]}
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: PLATFORM_COLORS[stat.platform].hex }}
            >
              {formatViewerCount(stat.totalViewers)}
            </div>
            <div className="mt-1 h-1 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: PLATFORM_COLORS[stat.platform].hex,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

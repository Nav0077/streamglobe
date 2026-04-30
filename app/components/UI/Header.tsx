// app/components/UI/Header.tsx

'use client';

import { Globe2 } from 'lucide-react';
import { PlatformStats } from '@/lib/types';
import { formatViewerCount } from '@/lib/markerUtils';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';

interface HeaderProps {
  stats: PlatformStats[];
  totalStreams: number;
}

export default function Header({ stats, totalStreams }: HeaderProps) {
  const totalViewers = stats.reduce((sum, s) => sum + s.totalViewers, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl 
                        border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Globe2 className="w-7 h-7 text-blue-400" />
          <h1 className="text-xl font-black text-white tracking-tight">
            Stream<span className="text-blue-400">Globe</span>
          </h1>
          <a 
            href="/setup" 
            className="hidden sm:block text-xs text-gray-500 border-l border-gray-700 pl-2 ml-1 hover:text-blue-400 transition-colors"
          >
            API Setup Guide
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Per-platform stats - Hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-3">
            {stats.map((stat) => (
              <div key={stat.platform} className="flex items-center gap-1.5 group cursor-default">
                <div
                  className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]"
                  style={{ 
                    backgroundColor: PLATFORM_COLORS[stat.platform].hex,
                    color: PLATFORM_COLORS[stat.platform].hex 
                  }}
                />
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">
                  {stat.liveCount}
                </span>
              </div>
            ))}
          </div>

          {/* Total stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-full border border-red-500/20">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold uppercase tracking-wider">
                {totalStreams} LIVE
              </span>
            </div>
            <div className="hidden xs:block text-gray-700">|</div>
            <div className="hidden xs:flex items-center gap-1 text-gray-400 font-medium">
              👁 {formatViewerCount(totalViewers)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

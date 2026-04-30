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
        <div className="flex items-center gap-4">
          {/* Per-platform stats */}
          <div className="hidden md:flex items-center gap-3">
            {stats.map((stat) => (
              <div key={stat.platform} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PLATFORM_COLORS[stat.platform].hex }}
                />
                <span className="text-xs text-gray-400">
                  {stat.liveCount}
                </span>
              </div>
            ))}
          </div>

          {/* Total stats */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-300 font-semibold">
                {totalStreams} live
              </span>
            </div>
            <div className="text-gray-500">|</div>
            <div className="text-gray-400">
              👁 {formatViewerCount(totalViewers)} watching
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

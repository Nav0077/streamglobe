// app/page.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStreams } from '@/hooks/useStreams';
import { useGlobe } from '@/hooks/useGlobe';
import { useRealtime } from '@/hooks/useRealtime';
import { streamsToMarkers } from '@/lib/markerUtils';
import { Platform, Stream, StreamFilters } from '@/lib/types';
import Header from './components/UI/Header';
import StatsBar from './components/UI/StatsBar';
import StreamPanel from './components/StreamPanel/StreamPanel';
import StreamCard from './components/StreamPanel/StreamCard';
import PlatformFilter from './components/Filters/PlatformFilter';
import SearchBar from './components/Filters/SearchBar';
import ViewerFilter from './components/Filters/ViewerFilter';

// Dynamic import for Globe (SSR off - canvas only works client-side)
const Globe = dynamic(() => import('./components/Globe/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square max-w-[800px] mx-auto flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Loading globe...</div>
    </div>
  ),
});

export default function Home() {
  // Filters
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [minViewers, setMinViewers] = useState(0);
  const [search, setSearch] = useState('');

  const filters: StreamFilters = useMemo(
    () => ({ platforms, minViewers, maxViewers: Infinity, search }),
    [platforms, minViewers, search]
  );

  // Data
  const { streams, stats, total, isLoading, mutate } = useStreams(filters);

  // Globe state
  const {
    selectedStream,
    isPanelOpen,
    focusPoint,
    isAutoRotating,
    selectStream,
    closePanel,
  } = useGlobe();

  // Realtime updates
  useRealtime(mutate);

  // Convert streams to globe markers
  const markers = useMemo(() => streamsToMarkers(streams), [streams]);

  // Top streams list (sidebar)
  const topStreams = useMemo(
    () => streams.slice(0, 20),
    [streams]
  );

  const handleMarkerClick = useCallback(
    (stream: Stream) => {
      selectStream(stream);
    },
    [selectStream]
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header stats={stats} totalStreams={total} />

      <main className="pt-16 flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar - Stream List */}
        <aside className="w-full lg:w-[360px] lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 
                          border-r border-gray-800/50 overflow-y-auto p-4 space-y-4 order-2 lg:order-1">
          {/* Filters */}
          <div className="space-y-3">
            <SearchBar value={search} onChange={setSearch} />
            <PlatformFilter
              selectedPlatforms={platforms}
              onChange={setPlatforms}
            />
            <ViewerFilter value={minViewers} onChange={setMinViewers} />
          </div>

          {/* Stats */}
          <StatsBar stats={stats} />

          {/* Stream List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Top Live Streams ({total})
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-800/30 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : topStreams.length > 0 ? (
              topStreams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onClick={handleMarkerClick}
                  isSelected={selectedStream?.id === stream.id}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No live streams found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Globe Area */}
        <div className="flex-1 flex items-center justify-center p-4 order-1 lg:order-2 
                        min-h-[60vh] lg:min-h-0">
          <div className="relative w-full max-w-[800px]">
            <Globe
              markers={markers}
              focusPoint={focusPoint}
              isAutoRotating={isAutoRotating}
              onMarkerClick={handleMarkerClick}
            />

            {/* Floating legend */}
            <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md 
                            rounded-xl p-3 border border-gray-700/30">
              <div className="text-xs text-gray-400 mb-2 font-semibold">Platforms</div>
              <div className="space-y-1.5">
                {stats.map((stat) => (
                  <div key={stat.platform} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          PLATFORM_COLORS_MAP[stat.platform],
                      }}
                    />
                    <span className="text-gray-300 capitalize">
                      {stat.platform}
                    </span>
                    <span className="text-gray-500">
                      ({stat.liveCount})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Panel */}
      <StreamPanel
        stream={selectedStream}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />

      {/* Panel Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={closePanel}
        />
      )}
    </div>
  );
}

// Quick reference for colors in template
const PLATFORM_COLORS_MAP: Record<string, string> = {
  youtube: '#FF0000',
  twitch: '#9146FF',
  kick: '#53FC18',
  facebook: '#1877F2',
};

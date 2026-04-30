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
        <aside className="w-full lg:w-[400px] lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 
                          border-r border-gray-800/50 overflow-y-auto p-4 space-y-6 order-2 lg:order-1 
                          bg-gray-950/50 backdrop-blur-sm">
          {/* Filters */}
          <div className="space-y-4 bg-gray-900/30 p-4 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Search & Filters</h3>
            <SearchBar value={search} onChange={setSearch} />
            <PlatformFilter
              selectedPlatforms={platforms}
              onChange={setPlatforms}
            />
            <ViewerFilter value={minViewers} onChange={setMinViewers} />
          </div>

          {/* Stats */}
          <div className="space-y-2">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Live Statistics</h3>
             <StatsBar stats={stats} />
          </div>

          {/* Stream List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Top Streams ({total})
              </h3>
              {isLoading && <span className="text-[10px] text-blue-400 animate-pulse font-bold uppercase">Refreshing...</span>}
            </div>
            
            <div className="space-y-2 max-h-[500px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar">
              {isLoading && streams.length === 0 ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-900/50 rounded-xl animate-pulse border border-white/5"
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
                <div className="text-center py-12 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                  <p className="text-gray-400 font-medium">No live streams found</p>
                  <p className="text-xs text-gray-600 mt-2">Try adjusting your filters or platform selection</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Globe Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 order-1 lg:order-2 
                        relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] -z-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10 animate-pulse delay-1000" />
          
          <div className="relative w-full max-w-[850px] transition-all duration-1000 ease-out">
            <Globe
              markers={markers}
              focusPoint={focusPoint}
              isAutoRotating={isAutoRotating}
              onMarkerClick={handleMarkerClick}
            />

            {/* Floating Legend - Desktop only */}
            <div className="hidden md:block absolute bottom-8 left-8 bg-gray-900/60 backdrop-blur-xl 
                            rounded-2xl p-4 border border-white/10 shadow-2xl">
              <div className="text-[10px] text-gray-500 mb-3 font-black uppercase tracking-widest">Active Platforms</div>
              <div className="space-y-2">
                {stats.map((stat) => (
                  <div key={stat.platform} className="flex items-center gap-3 text-xs group cursor-default">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-lg group-hover:scale-125 transition-transform"
                      style={{
                        backgroundColor:
                          PLATFORM_COLORS_MAP[stat.platform],
                        boxShadow: `0 0 10px ${PLATFORM_COLORS_MAP[stat.platform]}44`
                      }}
                    />
                    <span className="text-gray-300 font-medium capitalize">
                      {stat.platform}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {stat.liveCount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile Legend - Simple version */}
          <div className="flex md:hidden flex-wrap justify-center gap-4 mt-6 p-4 bg-gray-900/40 rounded-2xl border border-white/5 w-full">
            {stats.map((stat) => (
              <div key={stat.platform} className="flex items-center gap-1.5 text-[10px]">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PLATFORM_COLORS_MAP[stat.platform] }}
                />
                <span className="text-gray-400 capitalize font-bold">{stat.platform}</span>
                <span className="text-gray-600">{stat.liveCount}</span>
              </div>
            ))}
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

// app/page.tsx

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/UI/Header';
import StatsBar from './components/UI/StatsBar';
import StreamCard from './components/StreamPanel/StreamCard';
import Globe from './components/Globe/Globe';
import { Stream, Platform, Category } from './lib/types';
import { PLATFORM_COLORS } from './lib/constants';

const CATEGORIES: Category[] = ['Gaming', 'News', 'Entertainment', 'Education', 'Technology', 'Other'];

export default function Home() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube', 'twitch', 'kick', 'facebook']);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedStream, setFocusedStream] = useState<Stream | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/streams');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStreams(data.streams || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const filteredStreams = useMemo(() => {
    return streams.filter((s) => {
      const platformMatch = selectedPlatforms.includes(s.platform);
      const categoryMatch = selectedCategory === 'All' || s.category === selectedCategory;
      const searchMatch = searchQuery === '' || 
        s.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase());
      return platformMatch && categoryMatch && searchMatch;
    });
  }, [streams, selectedPlatforms, selectedCategory, searchQuery]);

  const markers = useMemo(() => {
    return filteredStreams.map((s) => ({
      location: [s.latitude, s.longitude] as [number, number],
      size: 0.1,
      stream: s,
    }));
  }, [filteredStreams]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleStreamClick = (stream: Stream) => {
    setFocusedStream(stream);
    setIsAutoRotating(false);
    // Smooth scroll to top on mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <Header streams={streams} />
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar: Controls & List */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl z-20">
          
          {/* Filters Section */}
          <div className="p-4 space-y-4 border-b border-white/5">
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search channels or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-xs">⌘K</span>
            </div>

            {/* Platforms */}
            <div className="flex flex-wrap gap-2">
              {(['youtube', 'twitch', 'kick', 'facebook'] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    selectedPlatforms.includes(p)
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'All' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Stream List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : filteredStreams.length > 0 ? (
              filteredStreams.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => handleStreamClick(s)}
                  className={`cursor-pointer transition-all ${focusedStream?.id === s.id ? 'ring-2 ring-red-500 rounded-xl' : ''}`}
                >
                  <StreamCard stream={s} />
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🛰️</div>
                <p className="text-gray-500 text-sm">No live streams found for these filters.</p>
                <button 
                  onClick={() => { setSelectedPlatforms(['youtube', 'twitch', 'kick', 'facebook']); setSelectedCategory('All'); setSearchQuery(''); }}
                  className="mt-4 text-red-400 text-xs hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <StatsBar streams={filteredStreams} />
        </div>

        {/* Right Area: Globe */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]">
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <Globe
              markers={markers}
              focusPoint={focusedStream ? [focusedStream.latitude, focusedStream.longitude] : null}
              isAutoRotating={isAutoRotating}
              onMarkerClick={handleStreamClick}
            />
          </div>

          {/* Floating HUD */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
            <div className="glass-morphism p-3 rounded-2xl border border-white/10 pointer-events-auto">
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${isAutoRotating ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                {isAutoRotating ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
              </button>
            </div>
          </div>

          {/* Bottom Platform Legend */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 glass-morphism px-6 py-3 rounded-full border border-white/10 z-30">
            {Object.entries(PLATFORM_COLORS).map(([name, config]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: config.hex, backgroundColor: config.hex }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

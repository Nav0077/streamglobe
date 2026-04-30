// app/components/StreamPanel/StreamDetails.tsx

'use client';

import { Stream } from '@/lib/types';
import { PLATFORM_COLORS } from '@/lib/constants';
import { formatViewerCount } from '@/lib/markerUtils';
import { Users, X, ExternalLink, Play, Globe } from 'lucide-react';

interface StreamDetailsProps {
  stream: Stream | null;
  onClose: () => void;
}

export default function StreamDetails({ stream, onClose }: StreamDetailsProps) {
  if (!stream) return null;

  const platformColor = PLATFORM_COLORS[stream.platform].hex;

  return (
    <div className="absolute inset-y-0 right-0 w-full sm:w-[400px] bg-black/60 backdrop-blur-2xl border-l border-white/10 z-50 transform transition-transform duration-300 shadow-2xl">
      {/* Header Image / Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {stream.thumbnailUrl ? (
          <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse">LIVE</div>
          <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Users className="w-3 h-3" />
            {formatViewerCount(stream.viewerCount)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-225px)] custom-scrollbar">
        {/* Channel Info */}
        <div className="flex items-start gap-4">
          {stream.channelAvatar ? (
            <img src={stream.channelAvatar} className="w-12 h-12 rounded-full border-2" style={{ borderColor: platformColor }} />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white/10 border-2" style={{ borderColor: platformColor }}>
              {stream.channelName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white leading-tight">{stream.channelName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: platformColor }}>{stream.platform}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{stream.category}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-white font-medium text-sm leading-relaxed">
            {stream.title}
          </h3>
          <p className="text-gray-500 text-xs">
            Started {stream.startedAt ? new Date(stream.startedAt).toLocaleTimeString() : 'Recently'}
          </p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Region</p>
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <Globe className="w-3 h-3 text-red-500" />
              {stream.country || 'Global'}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Language</p>
            <p className="text-white font-bold text-xs uppercase">{stream.language || 'Multi'}</p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href={stream.streamUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          style={{ backgroundColor: platformColor, color: 'white' }}
        >
          Watch Stream
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

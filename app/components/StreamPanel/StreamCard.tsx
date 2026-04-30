// app/components/StreamPanel/StreamCard.tsx

'use client';

import { Stream } from '@/lib/types';
import { formatViewerCount } from '@/lib/markerUtils';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { Users } from 'lucide-react';

interface StreamCardProps {
  stream: Stream;
  onClick: (stream: Stream) => void;
  isSelected?: boolean;
}

export default function StreamCard({ stream, onClick, isSelected }: StreamCardProps) {
  const platformColor = PLATFORM_COLORS[stream.platform].hex;

  return (
    <button
      onClick={() => onClick(stream)}
      className={`w-full text-left p-3 rounded-xl border transition-all hover:bg-gray-800/50 
                  ${isSelected
                    ? 'border-white/30 bg-gray-800/70'
                    : 'border-gray-700/30 bg-gray-900/30'
                  }`}
    >
      <div className="flex items-center gap-3">
        {stream.channelAvatar ? (
          <img
            src={stream.channelAvatar}
            alt={stream.channelName}
            className="w-10 h-10 rounded-full border"
            style={{ borderColor: platformColor }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: platformColor }}
          >
            {stream.channelName.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate">
              {stream.channelName}
            </span>
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{ backgroundColor: platformColor, color: 'white' }}
            >
              {PLATFORM_LABELS[stream.platform]}
            </span>
          </div>
          <p className="text-gray-400 text-xs truncate mt-0.5">{stream.title}</p>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Users className="w-3 h-3" />
          {formatViewerCount(stream.viewerCount)}
        </div>
      </div>
    </button>
  );
}

// app/components/StreamPanel/StreamPreview.tsx

'use client';

import { Stream } from '@/lib/types';
import { useState } from 'react';

interface StreamPreviewProps {
  stream: Stream;
}

export default function StreamPreview({ stream }: StreamPreviewProps) {
  const [showEmbed, setShowEmbed] = useState(false);

  const getEmbedUrl = () => {
    switch (stream.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${stream.platformId}?autoplay=1&mute=1`;
      case 'twitch':
        return `https://player.twitch.tv/?channel=${stream.channelName}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&muted=true`;
      case 'kick':
        return null; // Kick doesn't support embeds easily
      case 'facebook':
        return null;
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  if (!embedUrl) return null;

  return (
    <div className="mt-4">
      {!showEmbed ? (
        <button
          onClick={() => setShowEmbed(true)}
          className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 
                     rounded-xl text-gray-300 text-sm transition-colors"
        >
          ▶ Preview Stream
        </button>
      ) : (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
          <button
            onClick={() => setShowEmbed(false)}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black p-1 rounded-full"
          >
            <span className="text-white text-xs px-2">✕</span>
          </button>
        </div>
      )}
    </div>
  );
}

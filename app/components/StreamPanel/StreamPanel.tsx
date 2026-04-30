// app/components/StreamPanel/StreamPanel.tsx

'use client';

import { Stream } from '@/lib/types';
import { formatViewerCount, getTimeSince } from '@/lib/markerUtils';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Users, Clock, Globe2, Tag
} from 'lucide-react';
import StreamPreview from './StreamPreview';
import ViewerBadge from './ViewerBadge';

interface StreamPanelProps {
  stream: Stream | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StreamPanel({ stream, isOpen, onClose }: StreamPanelProps) {
  if (!stream) return null;

  const platformColor = PLATFORM_COLORS[stream.platform].hex;
  const platformLabel = PLATFORM_LABELS[stream.platform];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-gray-900/95 
                     backdrop-blur-xl border-l border-gray-700/50 z-50 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md z-10 p-4 
                          border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: platformColor }}
                />
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: platformColor }}
                >
                  {platformLabel}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Thumbnail / Preview */}
            {stream.thumbnailUrl && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-800">
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <ViewerBadge count={stream.viewerCount} />
                </div>
                <div className="absolute bottom-3 right-3 bg-red-600 px-2 py-1 
                                rounded text-xs font-bold text-white">
                  🔴 LIVE
                </div>
              </div>
            )}

            {/* Channel Info */}
            <div className="flex items-start gap-3">
              {stream.channelAvatar ? (
                <img
                  src={stream.channelAvatar}
                  alt={stream.channelName}
                  className="w-12 h-12 rounded-full border-2"
                  style={{ borderColor: platformColor }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: platformColor }}
                >
                  {stream.channelName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg truncate">
                  {stream.channelName}
                </h2>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {stream.title}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Viewers
                </div>
                <div className="text-white font-bold text-xl">
                  {formatViewerCount(stream.viewerCount)}
                </div>
              </div>

              {stream.startedAt && (
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Uptime
                  </div>
                  <div className="text-white font-bold text-xl">
                    {getTimeSince(stream.startedAt)}
                  </div>
                </div>
              )}

              {stream.category && (
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Tag className="w-3.5 h-3.5" />
                    Category
                  </div>
                  <div className="text-white font-semibold text-sm truncate">
                    {stream.category}
                  </div>
                </div>
              )}

              {stream.country && (
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Globe2 className="w-3.5 h-3.5" />
                    Location
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {stream.country}
                  </div>
                </div>
              )}
            </div>

            {/* Watch Button */}
            <a
              href={stream.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 
                         rounded-xl font-bold text-white transition-all hover:scale-[1.02] 
                         active:scale-[0.98]"
              style={{ backgroundColor: platformColor }}
            >
              <ExternalLink className="w-5 h-5" />
              Watch on {platformLabel}
            </a>

            {/* Stream Preview */}
            <StreamPreview stream={stream} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

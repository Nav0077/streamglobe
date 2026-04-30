// lib/markerUtils.ts

import { Stream, GlobeMarker, Platform } from './types';
import { PLATFORM_COLORS, MARKER_SIZE, MAX_MARKERS } from './constants';

export function streamToMarker(stream: Stream): GlobeMarker {
  return {
    location: [stream.latitude, stream.longitude],
    size: calculateMarkerSize(stream.viewerCount),
    color: PLATFORM_COLORS[stream.platform].rgb,
    stream,
  };
}

export function calculateMarkerSize(viewerCount: number): number {
  if (viewerCount <= 0) return MARKER_SIZE.MIN;
  const size = Math.log10(viewerCount + 1) * 0.02;
  return Math.min(Math.max(size, MARKER_SIZE.MIN), MARKER_SIZE.MAX);
}

export function streamsToMarkers(streams: Stream[]): GlobeMarker[] {
  // Sort by viewer count descending, take top MAX_MARKERS
  return streams
    .sort((a, b) => b.viewerCount - a.viewerCount)
    .slice(0, MAX_MARKERS)
    .map(streamToMarker);
}

export function formatViewerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function getTimeSince(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

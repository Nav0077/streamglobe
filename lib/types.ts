// lib/types.ts

export type Platform = 'youtube' | 'twitch' | 'kick' | 'facebook';

export interface Stream {
  id: string;
  platform: Platform;
  platformId: string;
  channelName: string;
  channelAvatar?: string;
  title: string;
  viewerCount: number;
  thumbnailUrl?: string;
  streamUrl: string;
  category?: string;
  language?: string;
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  startedAt?: string;
  lastUpdated: string;
  isLive: boolean;
}

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  size: number;
  color?: [number, number, number];
  stream: Stream;
}

export interface StreamFilters {
  platforms: Platform[];
  minViewers: number;
  maxViewers: number;
  category?: string;
  search?: string;
}

export interface PlatformStats {
  platform: Platform;
  liveCount: number;
  totalViewers: number;
}

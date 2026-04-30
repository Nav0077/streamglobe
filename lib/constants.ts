// lib/constants.ts

import { Platform } from './types';

export const PLATFORM_COLORS: Record<Platform, { hex: string; rgb: [number, number, number] }> = {
  youtube:  { hex: '#FF0000', rgb: [1, 0, 0] },
  twitch:   { hex: '#9146FF', rgb: [0.57, 0.27, 1] },
  kick:     { hex: '#53FC18', rgb: [0.33, 0.99, 0.09] },
  facebook: { hex: '#1877F2', rgb: [0.09, 0.47, 0.95] },
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  kick: 'Kick',
  facebook: 'Facebook',
};

export const MARKER_SIZE = {
  MIN: 0.03,
  MAX: 0.15,
};

export const REFRESH_INTERVAL = 60_000; // 60 seconds
export const MAX_MARKERS = 500; // Performance limit

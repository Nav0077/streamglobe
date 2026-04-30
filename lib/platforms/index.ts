// lib/platforms/index.ts

import { Stream, Platform } from '../types';
import { fetchYouTubeLiveStreams } from './youtube';
import { fetchTwitchLiveStreams } from './twitch';
import { fetchKickLiveStreams } from './kick';
import { fetchFacebookLiveStreams } from './facebook';

export async function fetchAllStreams(platforms: Platform[] = ['youtube', 'twitch', 'kick', 'facebook']): Promise<Stream[]> {
  const promises: Promise<Stream[]>[] = [];

  if (platforms.includes('youtube')) promises.push(fetchYouTubeLiveStreams());
  if (platforms.includes('twitch')) promises.push(fetchTwitchLiveStreams());
  if (platforms.includes('kick')) promises.push(fetchKickLiveStreams());
  if (platforms.includes('facebook')) promises.push(fetchFacebookLiveStreams());

  const results = await Promise.allSettled(promises);
  
  const allStreams: Stream[] = results
    .filter((res): res is PromiseFulfilledResult<Stream[]> => res.status === 'fulfilled')
    .flatMap(res => res.value);

  return allStreams;
}

export async function getUserLocation() {
  try {
    const res = await fetch('http://ip-api.com/json');
    const data = await res.json();
    if (data.status === 'success') {
      return {
        lat: data.lat,
        lon: data.lon,
        country: data.country,
        city: data.city,
      };
    }
  } catch (error) {
    console.error('Failed to get user location:', error);
  }
  return null;
}

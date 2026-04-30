// lib/platforms/youtube.ts

import { Stream, Category } from '../types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Massive discovery list
const DISCOVERY_QUERIES = [
  { cat: 'Gaming' as Category, q: 'gaming live' },
  { cat: 'Gaming' as Category, q: 'valorant' },
  { cat: 'Gaming' as Category, q: 'pubg' },
  { cat: 'Gaming' as Category, q: 'fortnite' },
  { cat: 'Gaming' as Category, q: 'minecraft' },
  { cat: 'Gaming' as Category, q: 'gta 5' },
  { cat: 'News' as Category, q: 'breaking news live' },
  { cat: 'News' as Category, q: 'world news' },
  { cat: 'News' as Category, q: 'nepal news' },
  { cat: 'News' as Category, q: 'india news' },
  { cat: 'Entertainment' as Category, q: 'vlog' },
  { cat: 'Entertainment' as Category, q: 'music live' },
  { cat: 'Entertainment' as Category, q: 'asmr' },
  { cat: 'Education' as Category, q: 'study with me' },
  { cat: 'Education' as Category, q: 'tutorial' },
  { cat: 'Technology' as Category, q: 'coding' },
  { cat: 'Technology' as Category, q: 'space' },
  { cat: 'Other' as Category, q: 'live' },
  { cat: 'Other' as Category, q: 'trending' },
];

export async function fetchYouTubeLiveStreams(): Promise<Stream[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY || API_KEY === 'your_youtube_api_key_here') return [];

  try {
    const regions = ['US', 'IN', 'NP', 'GB', 'BR', 'JP', 'KR', 'DE', 'FR', 'ID'];
    const fetchPromises: Promise<Stream[]>[] = [];
    
    // Mix general queries with regional top streams
    DISCOVERY_QUERIES.forEach(dq => {
      fetchPromises.push(fetchQuery(dq.cat, dq.q, 50, API_KEY));
    });

    regions.forEach(region => {
      fetchPromises.push(fetchQuery('Other', '', 50, API_KEY, region));
    });

    const results = await Promise.allSettled(fetchPromises);
    const merged: Stream[] = [];
    
    results.forEach(res => {
      if (res.status === 'fulfilled') merged.push(...res.value);
    });

    const uniqueMap = new Map();
    merged.forEach(s => uniqueMap.set(s.platformId, s));
    
    const final = Array.from(uniqueMap.values()).sort((a, b) => b.viewerCount - a.viewerCount);
    console.log(`🚀 YouTube: Massive discovery found ${final.length} unique streams`);
    return final;
  } catch (error) {
    return [];
  }
}

async function fetchQuery(category: Category, q: string, maxResults: number, apiKey: string, region?: string): Promise<Stream[]> {
  try {
    const url = new URL(`${YOUTUBE_API_BASE}/search`);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('eventType', 'live');
    url.searchParams.set('order', 'viewCount');
    if (q) url.searchParams.set('q', q);
    if (region) url.searchParams.set('regionCode', region);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (!data.items?.length) return [];

    const videoIds = data.items.map((i: any) => i.id.videoId).join(',');
    const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
    detailsUrl.searchParams.set('part', 'liveStreamingDetails,snippet');
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('key', apiKey);

    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json();

    const channelIds = Array.from(new Set(data.items.map((i: any) => i.snippet.channelId))).join(',');
    const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`);
    channelUrl.searchParams.set('part', 'snippet');
    channelUrl.searchParams.set('id', channelIds);
    channelUrl.searchParams.set('key', apiKey);

    const chRes = await fetch(channelUrl.toString());
    const chData = await chRes.json();
    const chMap = new Map();
    chData.items?.forEach((ch: any) => chMap.set(ch.id, { avatar: ch.snippet.thumbnails?.default?.url, country: ch.snippet.country }));

    return detailsData.items?.map((v: any) => {
      const info = chMap.get(v.snippet.channelId) || {};
      const coords = getCountryCoords(info.country || region || 'US');
      return {
        id: `youtube_${v.id}`,
        platform: 'youtube' as const,
        platformId: v.id,
        channelName: v.snippet.channelTitle,
        channelAvatar: info.avatar,
        title: v.snippet.title,
        viewerCount: parseInt(v.liveStreamingDetails?.concurrentViewers || '0'),
        thumbnailUrl: v.snippet.thumbnails?.medium?.url,
        streamUrl: `https://www.youtube.com/watch?v=${v.id}`,
        category,
        language: v.snippet.defaultLanguage,
        latitude: coords[0] + (Math.random() - 0.5) * 10, // Massive spread for density
        longitude: coords[1] + (Math.random() - 0.5) * 10,
        country: info.country || region,
        startedAt: v.liveStreamingDetails?.actualStartTime,
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };
    }) || [];
  } catch { return []; }
}

function getCountryCoords(code: string): [number, number] {
  const c: Record<string, [number, number]> = {
    US: [39.8, -98.5], GB: [55.4, -3.4], DE: [51.2, 10.4], FR: [46.2, 2.2], JP: [36.2, 138.3],
    KR: [35.9, 127.8], BR: [-14.2, -51.9], IN: [20.6, 79.0], RU: [61.5, 105.3], CA: [56.1, -106.3],
    AU: [-25.3, 133.8], MX: [23.6, -102.6], ES: [40.5, -3.7], IT: [41.9, 12.6], NL: [52.1, 5.3],
    SE: [60.1, 18.6], NO: [60.5, 8.5], PL: [51.9, 19.1], TW: [23.7, 121.0], TH: [15.9, 100.9],
    PH: [12.9, 121.8], ID: [-0.8, 113.9], VN: [14.1, 108.3], TR: [38.9, 35.2], AR: [-38.4, -63.6],
    CO: [4.6, -74.3], CL: [-35.7, -71.5], SA: [23.9, 45.1], AE: [23.4, 53.8], EG: [26.8, 30.8],
    ZA: [-30.6, 22.9], NG: [9.1, 8.7], KE: [-0.0, 37.9], NP: [28.4, 84.1]
  };
  return c[code] || [0, 0];
}

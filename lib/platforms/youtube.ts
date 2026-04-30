// lib/platforms/youtube.ts

import { Stream, Category } from '../types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Expanded categories for maximum discovery
const CATEGORY_QUERIES: Record<Category, string[]> = {
  Gaming: ['gaming live', 'esports live', 'fortnite live', 'minecraft live', 'cod live'],
  News: ['news live', 'breaking news live', 'world news live'],
  Entertainment: ['music live', 'entertainment live', 'talk show live', 'vlog live'],
  Education: ['study live', 'education live', 'learning live', 'lecture live'],
  Technology: ['tech live', 'coding live', 'space live', 'science live'],
  Other: ['live stream', 'trending live', 'top live']
};

export async function fetchYouTubeLiveStreams(): Promise<Stream[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY || API_KEY === 'your_youtube_api_key_here') {
    console.warn('YouTube API Key not configured');
    return [];
  }

  try {
    const allCategories = Object.keys(CATEGORY_QUERIES) as Category[];
    
    // Fetch multiple queries per category to expand the pool
    const fetchPromises: Promise<Stream[]>[] = [];
    
    allCategories.forEach(cat => {
      // Pick top 2 queries for each category to keep quota usage reasonable but coverage high
      CATEGORY_QUERIES[cat].slice(0, 2).forEach(query => {
        fetchPromises.push(fetchQuery(cat, query, 50, API_KEY));
      });
    });

    const categoryResults = await Promise.allSettled(fetchPromises);

    const mergedStreams: Stream[] = [];
    categoryResults.forEach(res => {
      if (res.status === 'fulfilled') {
        mergedStreams.push(...res.value);
      }
    });

    // Remove duplicates (by platformId)
    const uniqueMap = new Map();
    mergedStreams.forEach(s => uniqueMap.set(s.platformId, s));
    
    const finalStreams = Array.from(uniqueMap.values());
    console.log(`✅ YouTube: Discovered ${finalStreams.length} total unique live streams`);
    
    return finalStreams;
  } catch (error) {
    console.error('YouTube API Master Error:', error);
    return [];
  }
}

async function fetchQuery(category: Category, query: string, maxResults: number, apiKey: string): Promise<Stream[]> {
  try {
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('eventType', 'live');
    searchUrl.searchParams.set('order', 'viewCount'); // Get the most popular ones
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('maxResults', String(maxResults));
    searchUrl.searchParams.set('key', apiKey);

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return [];

    // Filter out items that are not actually live (sometimes YouTube API returns upcoming)
    const liveItems = searchData.items.filter((item: any) => item.snippet.liveBroadcastContent === 'live');
    if (liveItems.length === 0) return [];

    const videoIds = liveItems.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
    detailsUrl.searchParams.set('part', 'liveStreamingDetails,statistics,snippet');
    detailsUrl.searchParams.set('id', videoIds);
    detailsUrl.searchParams.set('key', apiKey);

    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json();

    const channelIds = Array.from(new Set(
      liveItems.map((item: any) => item.snippet.channelId)
    )).join(',');
    
    const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`);
    channelUrl.searchParams.set('part', 'snippet');
    channelUrl.searchParams.set('id', channelIds);
    channelUrl.searchParams.set('key', apiKey);

    const channelRes = await fetch(channelUrl.toString());
    const channelData = await channelRes.json();

    const channelMap = new Map();
    channelData.items?.forEach((ch: any) => {
      channelMap.set(ch.id, {
        avatar: ch.snippet.thumbnails?.default?.url,
        country: ch.snippet.country,
      });
    });

    return detailsData.items?.map((video: any) => {
      const channelInfo = channelMap.get(video.snippet.channelId) || {};
      const coords = getCountryCoords(channelInfo.country || 'US');

      return {
        id: `youtube_${video.id}`,
        platform: 'youtube' as const,
        platformId: video.id,
        channelName: video.snippet.channelTitle,
        channelAvatar: channelInfo.avatar,
        title: video.snippet.title,
        viewerCount: parseInt(video.liveStreamingDetails?.concurrentViewers || '0'),
        thumbnailUrl: video.snippet.thumbnails?.medium?.url,
        streamUrl: `https://www.youtube.com/watch?v=${video.id}`,
        category: category,
        language: video.snippet.defaultLanguage,
        latitude: coords[0] + (Math.random() - 0.5) * 4, // Spread them more for better visibility
        longitude: coords[1] + (Math.random() - 0.5) * 4,
        country: channelInfo.country,
        startedAt: video.liveStreamingDetails?.actualStartTime,
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };
    }) || [];
  } catch (e) {
    console.error(`Error fetching query "${query}":`, e);
    return [];
  }
}

function getCountryCoords(countryCode: string): [number, number] {
  const coords: Record<string, [number, number]> = {
    US: [39.8, -98.5], GB: [55.4, -3.4], DE: [51.2, 10.4],
    FR: [46.2, 2.2], JP: [36.2, 138.3], KR: [35.9, 127.8],
    BR: [-14.2, -51.9], IN: [20.6, 79.0], RU: [61.5, 105.3],
    CA: [56.1, -106.3], AU: [-25.3, 133.8], MX: [23.6, -102.6],
    ES: [40.5, -3.7], IT: [41.9, 12.6], NL: [52.1, 5.3],
    SE: [60.1, 18.6], NO: [60.5, 8.5], PL: [51.9, 19.1],
    TW: [23.7, 121.0], TH: [15.9, 100.9], PH: [12.9, 121.8],
    ID: [-0.8, 113.9], VN: [14.1, 108.3], TR: [38.9, 35.2],
    AR: [-38.4, -63.6], CO: [4.6, -74.3], CL: [-35.7, -71.5],
    SA: [23.9, 45.1], AE: [23.4, 53.8], EG: [26.8, 30.8],
    ZA: [-30.6, 22.9], NG: [9.1, 8.7], KE: [-0.0, 37.9],
  };
  return coords[countryCode] || [0, 0];
}

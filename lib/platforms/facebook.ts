// lib/platforms/facebook.ts

import { Stream } from '../types';

export async function fetchFacebookLiveStreams(): Promise<Stream[]> {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken || accessToken === 'your_facebook_access_token') {
      console.warn('Facebook access token not configured');
      return [];
    }

    // Facebook Graph API - search for live videos
    // Note: This requires specific permissions and is the most restrictive API
    const res = await fetch(
      `https://graph.facebook.com/v18.0/search?type=live_video&q=*&fields=id,title,live_views,permalink_url,from{name,picture}&limit=50&access_token=${accessToken}`
    );

    const data = await res.json();

    if (!data.data?.length) return [];

    const streams: Stream[] = data.data.map((video: any) => {
      const coords = getRandomCoords();
      return {
        id: `facebook_${video.id}`,
        platform: 'facebook' as const,
        platformId: video.id,
        channelName: video.from?.name || 'Unknown',
        channelAvatar: video.from?.picture?.data?.url,
        title: video.title || 'Facebook Live',
        viewerCount: video.live_views || 0,
        thumbnailUrl: undefined,
        streamUrl: video.permalink_url
          ? `https://facebook.com${video.permalink_url}`
          : `https://facebook.com/${video.id}`,
        category: 'Live',
        language: 'en',
        latitude: coords[0],
        longitude: coords[1],
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };
    });

    return streams;
  } catch (error) {
    console.error('Facebook API Error:', error);
    return [];
  }
}

function getRandomCoords(): [number, number] {
  const regions: [number, number][] = [
    [39.8, -98.5], [20.6, 79.0], [-14.2, -51.9],
    [9.1, 8.7], [12.9, 121.8], [14.1, 108.3],
    [-0.8, 113.9], [23.7, 121.0], [30.4, 69.3],
  ];
  const base = regions[Math.floor(Math.random() * regions.length)];
  return [
    base[0] + (Math.random() - 0.5) * 5,
    base[1] + (Math.random() - 0.5) * 5,
  ];
}

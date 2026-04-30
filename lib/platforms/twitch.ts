// lib/platforms/twitch.ts

import { Stream, Category } from '../types';

const TWITCH_API_BASE = 'https://api.twitch.tv/helix';

async function getTwitchAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.startsWith('your_')) {
    throw new Error('Twitch Client ID or Secret missing in environment variables');
  }

  try {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
      cache: 'no-store'
    });

    const data = await res.json();
    if (!data.access_token) {
      console.error('Twitch Auth Error Response:', data);
      throw new Error(`Twitch Auth Failed: ${data.message || 'No access token'}`);
    }
    return data.access_token;
  } catch (error: any) {
    console.error('Twitch Token Request Exception:', error.message);
    throw error;
  }
}

export async function fetchTwitchLiveStreams(limit = 100): Promise<Stream[]> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  
  try {
    const accessToken = await getTwitchAccessToken();
    
    // Get streams from multiple popular categories to ensure variety
    const url = new URL(`${TWITCH_API_BASE}/streams`);
    url.searchParams.set('first', String(limit));
    
    const res = await fetch(url.toString(), {
      headers: {
        'Client-ID': clientId!,
        'Authorization': `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 }
    });

    const data = await res.json();
    if (!data.data) {
      console.error('Twitch API Data Error:', data);
      return [];
    }

    return data.data.map((stream: any) => {
      const coords = getLanguageCoords(stream.language);
      return {
        id: `twitch_${stream.id}`,
        platform: 'twitch' as const,
        platformId: stream.id,
        channelName: stream.user_name,
        channelAvatar: '', // Twitch needs separate call for avatars
        title: stream.title,
        viewerCount: stream.viewer_count,
        thumbnailUrl: stream.thumbnail_url
          .replace('{width}', '440')
          .replace('{height}', '248'),
        streamUrl: `https://www.twitch.tv/${stream.user_login}`,
        category: mapTwitchCategory(stream.game_name),
        language: stream.language,
        latitude: coords[0] + (Math.random() - 0.5) * 8,
        longitude: coords[1] + (Math.random() - 0.5) * 8,
        startedAt: stream.started_at,
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };
    });
  } catch (error: any) {
    console.error('fetchTwitchLiveStreams Master Error:', error.message);
    return [];
  }
}

function mapTwitchCategory(gameName: string): Category {
  const name = (gameName || '').toLowerCase();
  if (name.includes('talk shows') || name.includes('just chatting')) return 'Entertainment';
  if (name.includes('software') || name.includes('science') || name.includes('tech')) return 'Technology';
  if (name.includes('education') || name.includes('tutorial')) return 'Education';
  if (name.includes('news')) return 'News';
  return 'Gaming';
}

function getLanguageCoords(lang: string): [number, number] {
  const langCoords: Record<string, [number, number]> = {
    en: [39.8, -98.5], es: [40.5, -3.7], pt: [-14.2, -51.9],
    fr: [46.2, 2.2], de: [51.2, 10.4], ja: [36.2, 138.3],
    ko: [35.9, 127.8], ru: [61.5, 105.3], zh: [35.8, 104.1],
    hi: [20.6, 79.0], tr: [38.9, 35.2], it: [41.9, 12.6],
    th: [15.9, 100.9], vi: [14.1, 108.3],
  };
  return langCoords[lang] || [0, 0];
}

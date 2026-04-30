// lib/platforms/twitch.ts

import { Stream } from '../types';

const TWITCH_API_BASE = 'https://api.twitch.tv/helix';

async function getTwitchAccessToken(): Promise<string> {
  // Use cached token if available and NOT a placeholder
  const cachedToken = process.env.TWITCH_ACCESS_TOKEN;
  if (cachedToken && !cachedToken.startsWith('your_') && cachedToken.length > 10) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.startsWith('your_')) {
    throw new Error('Twitch Client ID or Secret missing');
  }

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to get Twitch token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export async function fetchTwitchLiveStreams(
  first = 100,
  cursor?: string
): Promise<Stream[]> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'your_twitch_client_id') {
      console.warn('Twitch API credentials not configured');
      return [];
    }

    const accessToken = await getTwitchAccessToken();

    const url = new URL(`${TWITCH_API_BASE}/streams`);
    url.searchParams.set('first', String(first));
    url.searchParams.set('type', 'live');
    if (cursor) url.searchParams.set('after', cursor);

    const res = await fetch(url.toString(), {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!data.data?.length) return [];

    // Fetch user details for avatars and locations
    const userIds = data.data.map((s: any) => s.user_id);
    const usersUrl = new URL(`${TWITCH_API_BASE}/users`);
    userIds.slice(0, 100).forEach((id: string) => {
      usersUrl.searchParams.append('id', id);
    });

    const usersRes = await fetch(usersUrl.toString(), {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const usersData = await usersRes.json();

    const userMap = new Map();
    usersData.data?.forEach((user: any) => {
      userMap.set(user.id, {
        avatar: user.profile_image_url,
        description: user.description,
      });
    });

    const streams: Stream[] = data.data.map((stream: any) => {
      const userInfo = userMap.get(stream.user_id) || {};
      // Twitch doesn't provide geo - use language as proxy
      const coords = getLanguageCoords(stream.language);

      return {
        id: `twitch_${stream.id}`,
        platform: 'twitch' as const,
        platformId: stream.id,
        channelName: stream.user_name,
        channelAvatar: userInfo.avatar,
        title: stream.title,
        viewerCount: stream.viewer_count,
        thumbnailUrl: stream.thumbnail_url
          .replace('{width}', '440')
          .replace('{height}', '248'),
        streamUrl: `https://www.twitch.tv/${stream.user_login}`,
        category: stream.game_name,
        language: stream.language,
        latitude: coords[0] + (Math.random() - 0.5) * 3,
        longitude: coords[1] + (Math.random() - 0.5) * 3,
        startedAt: stream.started_at,
        lastUpdated: new Date().toISOString(),
        isLive: true,
      };
    });

    return streams;
  } catch (error) {
    console.error('Twitch API Error:', error);
    return [];
  }
}

function getLanguageCoords(lang: string): [number, number] {
  const langCoords: Record<string, [number, number]> = {
    en: [39.8, -98.5], es: [40.5, -3.7], pt: [-14.2, -51.9],
    fr: [46.2, 2.2], de: [51.2, 10.4], it: [41.9, 12.6],
    ru: [61.5, 105.3], ja: [36.2, 138.3], ko: [35.9, 127.8],
    zh: [35.9, 104.2], th: [15.9, 100.9], tr: [38.9, 35.2],
    pl: [51.9, 19.1], nl: [52.1, 5.3], sv: [60.1, 18.6],
    ar: [23.9, 45.1], hi: [20.6, 79.0], vi: [14.1, 108.3],
    id: [-0.8, 113.9], hu: [47.2, 19.5], cs: [49.8, 15.5],
    fi: [61.9, 25.7], da: [56.3, 9.5], no: [60.5, 8.5],
    el: [39.1, 21.8], ro: [45.9, 25.0], uk: [48.4, 31.2],
  };
  return langCoords[lang] || [0, 0];
}

// lib/platforms/kick.ts

import { Stream } from '../types';

const KICK_API_BASE = 'https://kick.com/api/v2';

export async function fetchKickLiveStreams(): Promise<Stream[]> {
  try {
    // Kick doesn't have a "list all live" endpoint
    // We use the featured/categories approach
    const categoriesRes = await fetch(`${KICK_API_BASE}/categories`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StreamGlobe/1.0',
      },
    });

    const categories = await categoriesRes.json();
    const streams: Stream[] = [];

    // Fetch top channels from top categories
    const topCategories = (categories.data || categories)?.slice(0, 5) || [];

    for (const cat of topCategories) {
      try {
        const catSlug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-');
        const res = await fetch(
          `${KICK_API_BASE}/categories/${catSlug}/channels?page=1&limit=20&sort=viewers`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'StreamGlobe/1.0',
            },
          }
        );

        const channelData = await res.json();
        const channels = channelData.data || channelData || [];

        for (const channel of channels) {
          if (channel.is_live || channel.livestream) {
            const livestream = channel.livestream || {};
            const coords = getRandomCoords();

            streams.push({
              id: `kick_${channel.id || channel.slug}`,
              platform: 'kick',
              platformId: String(channel.id || channel.slug),
              channelName: channel.user?.username || channel.slug || 'Unknown',
              channelAvatar: channel.user?.profile_pic || channel.avatar,
              title: livestream.session_title || channel.slug || 'Live Stream',
              viewerCount: channel.viewer_count || livestream.viewer_count || 0,
              thumbnailUrl: livestream.thumbnail?.url || channel.banner_image,
              streamUrl: `https://kick.com/${channel.slug}`,
              category: cat.name || livestream.categories?.[0]?.name,
              language: livestream.language || 'en',
              latitude: coords[0],
              longitude: coords[1],
              lastUpdated: new Date().toISOString(),
              isLive: true,
            });
          }
        }
      } catch (e) {
        console.error(`Kick category fetch error:`, e);
      }
    }

    return streams;
  } catch (error) {
    console.error('Kick API Error:', error);
    return [];
  }
}

function getRandomCoords(): [number, number] {
  // Distribute across popular streaming regions
  const regions: [number, number][] = [
    [39.8, -98.5], [51.5, -0.1], [48.9, 2.3],
    [35.7, 139.7], [37.6, 127.0], [-23.6, -46.6],
    [55.8, 37.6], [19.4, -99.1], [1.4, 103.8],
    [-33.9, 151.2], [52.5, 13.4], [40.4, -3.7],
  ];
  const base = regions[Math.floor(Math.random() * regions.length)];
  return [
    base[0] + (Math.random() - 0.5) * 5,
    base[1] + (Math.random() - 0.5) * 5,
  ];
}

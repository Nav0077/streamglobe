// app/api/cron/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchYouTubeLiveStreams } from '@/lib/platforms/youtube';
import { fetchTwitchLiveStreams } from '@/lib/platforms/twitch';
import { fetchKickLiveStreams } from '@/lib/platforms/kick';
import { fetchFacebookLiveStreams } from '@/lib/platforms/facebook';
import { Stream } from '@/lib/types';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 Starting stream refresh...');

  try {
    // Fetch from all platforms in parallel
    const [youtubeStreams, twitchStreams, kickStreams, facebookStreams] =
      await Promise.allSettled([
        fetchYouTubeLiveStreams(50),
        fetchTwitchLiveStreams(100),
        fetchKickLiveStreams(),
        fetchFacebookLiveStreams(),
      ]);

    const allStreams: Stream[] = [
      ...(youtubeStreams.status === 'fulfilled' ? youtubeStreams.value : []),
      ...(twitchStreams.status === 'fulfilled' ? twitchStreams.value : []),
      ...(kickStreams.status === 'fulfilled' ? kickStreams.value : []),
      ...(facebookStreams.status === 'fulfilled' ? facebookStreams.value : []),
    ];

    console.log(`📊 Fetched ${allStreams.length} total streams`);

    // Mark all existing streams as not live
    await supabaseAdmin
      .from('streams')
      .update({ is_live: false })
      .eq('is_live', true);

    // Upsert all fetched streams
    if (allStreams.length > 0) {
      const rows = allStreams.map((s) => ({
        id: s.id,
        platform: s.platform,
        platform_id: s.platformId,
        channel_name: s.channelName,
        channel_avatar: s.channelAvatar,
        title: s.title,
        viewer_count: s.viewerCount,
        thumbnail_url: s.thumbnailUrl,
        stream_url: s.streamUrl,
        category: s.category,
        language: s.language,
        latitude: s.latitude,
        longitude: s.longitude,
        country: s.country,
        city: s.city,
        started_at: s.startedAt,
        last_updated: new Date().toISOString(),
        is_live: true,
      }));

      const { error } = await supabaseAdmin
        .from('streams')
        .upsert(rows, { onConflict: 'platform,platform_id' });

      if (error) {
        console.error('DB upsert error:', error);
      }
    }

    // Clean up old non-live streams (older than 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('streams')
      .delete()
      .eq('is_live', false)
      .lt('last_updated', oneDayAgo);

    return NextResponse.json({
      success: true,
      counts: {
        youtube: youtubeStreams.status === 'fulfilled' ? youtubeStreams.value.length : 0,
        twitch: twitchStreams.status === 'fulfilled' ? twitchStreams.value.length : 0,
        kick: kickStreams.status === 'fulfilled' ? kickStreams.value.length : 0,
        facebook: facebookStreams.status === 'fulfilled' ? facebookStreams.value.length : 0,
        total: allStreams.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Refresh failed' },
      { status: 500 }
    );
  }
}

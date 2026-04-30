// app/api/streams/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Stream not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: data.id,
    platform: data.platform,
    platformId: data.platform_id,
    channelName: data.channel_name,
    channelAvatar: data.channel_avatar,
    title: data.title,
    viewerCount: data.viewer_count,
    thumbnailUrl: data.thumbnail_url,
    streamUrl: data.stream_url,
    category: data.category,
    language: data.language,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    country: data.country,
    city: data.city,
    startedAt: data.started_at,
    lastUpdated: data.last_updated,
    isLive: data.is_live,
  });
}

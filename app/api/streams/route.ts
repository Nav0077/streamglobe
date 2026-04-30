// app/api/streams/route.ts

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platforms = searchParams.get('platforms')?.split(',') || [];
  const minViewers = parseInt(searchParams.get('minViewers') || '0');
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '500');

  let query = supabase
    .from('streams')
    .select('*')
    .eq('is_live', true)
    .gte('viewer_count', minViewers)
    .order('viewer_count', { ascending: false })
    .limit(limit);

  if (platforms.length > 0) {
    query = query.in('platform', platforms);
  }

  if (search) {
    query = query.or(
      `channel_name.ilike.%${search}%,title.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform from snake_case to camelCase
  const streams = (data || []).map((row: any) => ({
    id: row.id,
    platform: row.platform,
    platformId: row.platform_id,
    channelName: row.channel_name,
    channelAvatar: row.channel_avatar,
    title: row.title,
    viewerCount: row.viewer_count,
    thumbnailUrl: row.thumbnail_url,
    streamUrl: row.stream_url,
    category: row.category,
    language: row.language,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    country: row.country,
    city: row.city,
    startedAt: row.started_at,
    lastUpdated: row.last_updated,
    isLive: row.is_live,
  }));

  return NextResponse.json({
    streams,
    total: streams.length,
    timestamp: new Date().toISOString(),
  });
}

// hooks/useStreams.ts

import useSWR from 'swr';
import { Stream, StreamFilters, PlatformStats } from '@/lib/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStreams(filters?: StreamFilters) {
  const params = new URLSearchParams();

  if (filters?.platforms?.length) {
    params.set('platforms', filters.platforms.join(','));
  }
  if (filters?.minViewers) {
    params.set('minViewers', String(filters.minViewers));
  }
  if (filters?.search) {
    params.set('search', filters.search);
  }

  const queryString = params.toString();
  const url = `/api/streams${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });

  const streams: Stream[] = data?.streams || [];

  const stats: PlatformStats[] = (['youtube', 'twitch', 'kick', 'facebook'] as const).map(
    (platform) => {
      const platformStreams = streams.filter((s) => s.platform === platform);
      return {
        platform,
        liveCount: platformStreams.length,
        totalViewers: platformStreams.reduce((sum, s) => sum + s.viewerCount, 0),
      };
    }
  );

  return {
    streams,
    stats,
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
}

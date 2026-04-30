// app/components/Filters/PlatformFilter.tsx

'use client';

import { Platform } from '@/lib/types';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';

interface PlatformFilterProps {
  selectedPlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

const ALL_PLATFORMS: Platform[] = ['youtube', 'twitch', 'kick', 'facebook'];

export default function PlatformFilter({
  selectedPlatforms,
  onChange,
}: PlatformFilterProps) {
  const toggle = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  const allSelected = selectedPlatforms.length === 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
          ${allSelected
            ? 'bg-white text-black'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
      >
        All
      </button>
      {ALL_PLATFORMS.map((platform) => {
        const isActive = selectedPlatforms.includes(platform);
        const color = PLATFORM_COLORS[platform].hex;

        return (
          <button
            key={platform}
            onClick={() => toggle(platform)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all 
                        border ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            style={{
              backgroundColor: isActive ? color : 'transparent',
              borderColor: isActive ? color : '#374151',
            }}
          >
            {PLATFORM_LABELS[platform]}
          </button>
        );
      })}
    </div>
  );
}

// app/components/Filters/ViewerFilter.tsx

'use client';

interface ViewerFilterProps {
  value: number;
  onChange: (value: number) => void;
}

const PRESETS = [
  { label: 'All', value: 0 },
  { label: '100+', value: 100 },
  { label: '1K+', value: 1000 },
  { label: '10K+', value: 10000 },
  { label: '100K+', value: 100000 },
];

export default function ViewerFilter({ value, onChange }: ViewerFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500 text-xs mr-1">Min viewers:</span>
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all
            ${value === preset.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

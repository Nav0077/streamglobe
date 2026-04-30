// app/components/Filters/SearchBar.tsx

'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div
      className={`relative flex items-center rounded-xl border transition-all
        ${focused
          ? 'border-blue-500/50 bg-gray-800/80 ring-2 ring-blue-500/20'
          : 'border-gray-700/50 bg-gray-800/40'
        }`}
    >
      <Search className="w-4 h-4 text-gray-400 ml-3" />
      <input
        type="text"
        placeholder="Search channels..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent text-white text-sm px-3 py-2 
                   outline-none placeholder-gray-500"
      />
      {value && (
        <button
          onClick={handleClear}
          className="p-1 mr-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  );
}

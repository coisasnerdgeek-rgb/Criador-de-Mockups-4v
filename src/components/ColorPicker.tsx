import React, { useRef } from 'react';
import { CheckIcon, OriginalColorIcon, MagicWandIcon, LoadingSpinner } from './Icons';
import { ColorPalette } from '@/types'; // Fixed import path

const presetColors = [
    // Neutrals
    '#FFFFFF', '#E5E7EB', '#9CA3AF', '#4B5563', '#1F2937', '#000000',
    // Warm Tones
    '#F87171', // Red
    '#F59E0B', // Amber
    '#D97706', // Orange
    '#78350F', // Brown
    '#FCA5A5', // Light Red/Pink
    '#FDE68A', // Light Yellow
    '#881337', // Burgundy
    // Cool Tones
    '#34D399', // Emerald
    '#059669', // Green
    '#065F46', // Dark Green
    '#1E40AF', // Dark Blue
    '#60A5FA', // Blue
    '#2563EB', // Indigo
    '#14B8A6', // Teal
    // Purples & Pinks
    '#A78BFA', // Violet
    '#7C3AED', // Purple
    '#EC4899', // Pink
    '#BE185D', // Fuchsia
    // Muted/Pastel
    '#A3E635', // Lime
    '#A5B4FC', // Light Indigo
    '#67E8F9', // Cyan
    '#FBCFE8', // Light Pink
];

const getContrastColor = (hexcolor: string | null) => {
    if (!hexcolor) return 'black';
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) {
      hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'text-black' : 'text-white';
};

interface ColorPickerProps {
    selectedColor: string | null;
    onColorChange: (color: string | null) => void;
    onAddCustomColor: (color: string) => void;
    disabled: boolean;
    customColors: string[];
    suggestedPalettes: ColorPalette[] | null;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
    selectedColor, onColorChange, onAddCustomColor, disabled, customColors, suggestedPalettes 
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorButtonClick = () => {
    colorInputRef.current?.click();
  };
    
  return (
    <div className={`w-full space-y-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
         <button
            type="button"
            disabled={disabled}
            onClick={() => onColorChange(null)}
            className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 transform hover:scale-110 flex items-center justify-center disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedColor === null ? 'border-purple-400 ring-2 ring-purple-400' : 'border-gray-400 dark:border-gray-600 bg-gray-200 dark:bg-gray-700'}`}
            aria-label="Manter cor original"
            title="Manter cor original"
          >
           <OriginalColorIcon className={selectedColor === null ? 'text-purple-400' : 'text-gray-600 dark:text-gray-300'} />
         </button>
        {presetColors.map(color => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedColor?.toUpperCase() === color.toUpperCase() ? 'border-purple-400 ring-2 ring-purple-400' : 'border-gray-400 dark:border-gray-600'}`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            title={color}
          >
            {selectedColor?.toUpperCase() === color.toUpperCase() && (
              <span className="flex items-center justify-center h-full">
                <CheckIcon className={getContrastColor(color)} />
              </span>
            )}
          </button>
        ))}
        {customColors.map(color => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedColor?.toUpperCase() === color.toUpperCase() ? 'border-purple-400 ring-2 ring-purple-400' : 'border-gray-400 dark:border-gray-600'}`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            title={color}
          >
            {selectedColor?.toUpperCase() === color.toUpperCase() && (
              <span className="flex items-center justify-center h-full">
                <CheckIcon className={getContrastColor(color)} />
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={handleCustomColorButtonClick}
          className="w-6 h-6 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:border-purple-500 transition-all"
          title="Cor personalizada"
        >
          <div className="w-4 h-4 rounded-full" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #F44336 0deg, #FFEB3B 60deg, #4CAF50 120deg, #2196F3 180deg, #9C27B0 240deg, #F44336 360deg)' }} />
          <input
            ref={colorInputRef}
            type="color"
            value={typeof selectedColor === 'string' ? selectedColor : '#FFFFFF'}
            onInput={(e) => onColorChange(e.currentTarget.value)}
            onChange={(e) => onAddCustomColor(e.currentTarget.value)}
            className="absolute w-0 h-0 opacity-0"
            disabled={disabled}
          />
        </button>
      </div>

      {suggestedPalettes && (
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            {suggestedPalettes.map((palette) => (
                <div key={palette.paletteName}>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{palette.paletteName}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        {palette.colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                disabled={disabled}
                                onClick={() => onColorChange(color)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 transform hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedColor?.toUpperCase() === color.toUpperCase() ? 'border-purple-400 ring-2 ring-purple-400' : 'border-gray-400 dark:border-gray-600'}`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                                title={color}
                            >
                               {selectedColor?.toUpperCase() === color.toUpperCase() && (
                                <span className="flex items-center justify-center h-full">
                                    <CheckIcon className={getContrastColor(color)} />
                                </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { ColorPicker } from '../ColorPicker';
import { ColorPalette, Print, SavedClothing } from '../../types';
import { MagicWandIcon, LoadingSpinner, PaletteIcon } from '../Icons';

interface ColorSettingProps {
    selectedColor: string | null;
    setSelectedColor: React.Dispatch<React.SetStateAction<string | null>>;
    customColors: string[];
    handleAddCustomColor: (color: string) => void;
    selectedClothing: SavedClothing | null;
    handleSuggestColors: () => Promise<void>;
    isSuggestingColors: boolean;
    suggestedPalettes: ColorPalette[] | null;
    selectedPrintFront: Print | undefined;
}

export const ColorSetting: React.FC<ColorSettingProps> = ({
    selectedColor,
    setSelectedColor,
    customColors,
    handleAddCustomColor,
    selectedClothing,
    handleSuggestColors,
    isSuggestingColors,
    suggestedPalettes,
    selectedPrintFront,
}) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <PaletteIcon /> Cor da Roupa
                </label>
                <button onClick={handleSuggestColors} disabled={!selectedPrintFront || isSuggestingColors} className="text-xs flex items-center gap-1.5 bg-purple-600/50 text-white px-3 py-1.5 rounded-md hover:bg-purple-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {isSuggestingColors ? <LoadingSpinner className="h-4 w-4" /> : <MagicWandIcon className="h-4 w-4" />}
                    Sugerir Cores com IA
                </button>
            </div>
            <ColorPicker
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                onAddCustomColor={handleAddCustomColor}
                disabled={!selectedClothing}
                customColors={customColors}
                suggestedPalettes={suggestedPalettes}
            />
        </div>
    );
};
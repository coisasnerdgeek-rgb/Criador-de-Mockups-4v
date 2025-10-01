import React from 'react';
import { SavedClothing } from '@/types';
import { LayersIcon } from '@/components/Icons';

interface BlendModeSettingProps {
    blendMode: string;
    setBlendMode: React.Dispatch<React.SetStateAction<string>>;
    selectedClothing: SavedClothing | null;
}

const blendModes = ['Normal', 'Multiply', 'Screen', 'Overlay'];

export const BlendModeSetting: React.FC<BlendModeSettingProps> = ({
    blendMode,
    setBlendMode,
    selectedClothing,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block flex items-center gap-2">
                <LayersIcon/> Modo de Mesclagem
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {blendModes.map(mode => (
                    <button
                        key={mode}
                        onClick={() => setBlendMode(mode)}
                        disabled={!selectedClothing}
                        className={`p-2 text-sm rounded-md transition-colors ${blendMode === mode ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                        title={`Aplicar estampa com o modo ${mode}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    );
};
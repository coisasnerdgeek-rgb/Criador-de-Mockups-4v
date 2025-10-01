import React from 'react';
import { GenerationMode, SavedClothing } from '../../types';
import { LoadingSpinner } from '@/components/Icons';

interface GenerationModeSettingProps {
    generationMode: GenerationMode;
    setGenerationMode: React.Dispatch<React.SetStateAction<GenerationMode>>;
    selectedClothing: SavedClothing | null;
    generationType: 'standard' | 'poses-3' | 'models';
    promptSettings: any; // Assuming promptSettings is passed down
    modelFilter: any; // Assuming modelFilter is passed down
    selectedPoses: any; // Assuming selectedPoses is passed down
    handlePoseSelection: (pose: any) => void;
    setModelFilter: (filter: any) => void;
}

export const GenerationModeSetting: React.FC<GenerationModeSettingProps> = ({
    generationMode,
    setGenerationMode,
    selectedClothing,
    generationType,
    promptSettings,
    modelFilter,
    selectedPoses,
    handlePoseSelection,
    setModelFilter,
}) => {
    return (
        <div className="space-y-2">
            {generationType === 'poses-3' && (
                <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                    <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Selecionar Poses</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(promptSettings.poses) as any[]).map(pose => (
                            <button
                                key={pose}
                                onClick={() => handlePoseSelection(pose)}
                                className={`p-2 rounded-md cursor-pointer text-sm w-full transition-colors ${selectedPoses.includes(pose) ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                {pose}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {generationType === 'models' && (
                <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                    <h4 className="font-semibold text-gray-500 dark:text-gray-400">Filtros de Modelo</h4>
                    <select value={modelFilter.gender} onChange={e => setModelFilter(f => ({...f, gender: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                        <option>Feminino</option>
                        <option>Masculino</option>
                    </select>
                    <select value={modelFilter.age} onChange={e => setModelFilter(f => ({...f, age: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                        <option>Infantil (5-12)</option>
                        <option>Jovem (18-25)</option>
                        <option>Adulto (26-40)</option>
                        <option>Maduro (41+)</option>
                    </select>
                    <select value={modelFilter.ethnicity} onChange={e => setModelFilter(f => ({...f, ethnicity: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                        <option>Caucasiana</option>
                        <option>Negra</option>
                        <option>Asiática</option>
                        <option>Hispânica</option>
                        <option>Indígena</option>
                    </select>
                </div>
            )}
            {generationType === 'standard' && (
                <div>
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block">Lados para Gerar</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setGenerationMode('front')} disabled={!selectedClothing} className={`p-2 text-sm rounded-md ${generationMode === 'front' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Frente</button>
                        <button onClick={() => setGenerationMode('back')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'back' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Costas</button>
                        <button onClick={() => setGenerationMode('both')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Ambos</button>
                    </div>
                </div>
            )}
        </div>
    );
};
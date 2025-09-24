import React from 'react';
import { LoadingSpinner, MagicWandIcon, ZipIcon } from '../Icons';

interface GenerateActionsProps {
    isLoading: boolean;
    isBatchingPreviews: boolean;
    error: string | null;
    handleGenerate: () => Promise<void>;
    handleGenerateAssociationsBatch: () => Promise<void>;
    canGenerate: boolean;
}

export const GenerateActions: React.FC<GenerateActionsProps> = ({
    isLoading,
    isBatchingPreviews,
    error,
    handleGenerate,
    handleGenerateAssociationsBatch,
    canGenerate,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg space-y-3 animated-mask-outline">
            <h2 className="text-xl font-bold text-center mb-2 text-purple-500 dark:text-purple-400">Gerar Mockup</h2>
            <button onClick={handleGenerate} disabled={!canGenerate} className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-gray-500 dark:disabled:hover:bg-gray-600">
                {isLoading ? <LoadingSpinner /> : <MagicWandIcon />}
                {isLoading ? 'Gerando...' : 'Gerar'}
            </button>
            <button onClick={handleGenerateAssociationsBatch} disabled={isBatchingPreviews} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 text-sm disabled:bg-gray-500 dark:disabled:bg-gray-600">
                {isBatchingPreviews ? <LoadingSpinner /> : <ZipIcon />} Exportar Associações
            </button>
            {error && <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded-md text-center">{error}</p>}
        </div>
    );
};
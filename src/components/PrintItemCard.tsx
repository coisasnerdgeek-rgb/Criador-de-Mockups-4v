import React, { memo } from 'react';
import { Print } from '@/types';
import { CheckIcon, TrashIcon, MagicWandIcon, LoadingSpinner } from '@/components/Icons';

interface PrintItemCardProps {
    print: Print;
    isSelectedFront: boolean;
    isSelectedBack: boolean;
    onSelectFront: (id: string) => void;
    onSelectBack: (id: string) => void;
    onRemoveBg: (printId: string) => Promise<void>;
    isRemovingBackground: boolean;
    canSelectBack: boolean;
    onEnlarge: (url: string) => void;
    onDelete: (id: string) => void;
}

export const PrintItemCard = memo(({
    print,
    isSelectedFront,
    isSelectedBack,
    onSelectFront,
    onSelectBack,
    onRemoveBg,
    isRemovingBackground,
    canSelectBack,
    onEnlarge,
    onDelete,
}: PrintItemCardProps) => {
    return (
        <div 
            className={`relative group bg-gray-100 dark:bg-gray-900/50 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${isSelectedFront || isSelectedBack ? 'ring-2 ring-cyan-500 scale-105' : 'hover:shadow-lg hover:scale-102'}`}
        >
            <img 
                src={`data:${print.mimeType};base64,${print.base64}`} 
                alt={print.name} 
                className="w-full h-24 object-contain bg-gray-200 dark:bg-gray-700"
                onClick={() => onEnlarge(`data:${print.mimeType};base64,${print.base64}`)}
            />
            <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={print.name}>{print.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {print.hasBgRemoved ? 'Fundo Removido' : 'Fundo Original'}
                </p>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSelectFront(print.id); }} 
                        className={`bg-cyan-600 text-white p-2 rounded-full shadow-lg hover:bg-cyan-500 transition-all ${isSelectedFront ? 'ring-2 ring-white' : ''}`}
                        title="Selecionar para Frente"
                    >
                        F {isSelectedFront && <CheckIcon className="inline-block h-4 w-4 ml-1" />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSelectBack(print.id); }} 
                        disabled={!canSelectBack}
                        className={`bg-violet-600 text-white p-2 rounded-full shadow-lg hover:bg-violet-500 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed ${isSelectedBack ? 'ring-2 ring-white' : ''}`}
                        title="Selecionar para Costas"
                    >
                        C {isSelectedBack && <CheckIcon className="inline-block h-4 w-4 ml-1" />}
                    </button>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveBg(print.id); }} 
                        disabled={isRemovingBackground}
                        className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-500 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                        title="Remover Fundo com IA"
                    >
                        {isRemovingBackground ? <LoadingSpinner className="h-5 w-5" /> : <MagicWandIcon />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(print.id); }} 
                        className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-500 transition-all"
                        title="Deletar Estampa"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
});
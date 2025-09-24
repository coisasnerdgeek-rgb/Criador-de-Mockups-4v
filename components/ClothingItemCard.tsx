import React, { memo } from 'react';
import { SavedClothing } from '../types';
import { PencilIcon, TrashIcon, PositionIcon, PlusCircleIcon } from './Icons';

interface ClothingItemCardProps {
    clothing: SavedClothing;
    isSelected: boolean;
    onSelect: (clothing: SavedClothing) => void;
    onDelete: (id: string) => void;
    onRename: (clothing: SavedClothing) => void;
    onEnlarge: (url: string) => void;
    onEditMask: (clothing: SavedClothing, isBack: boolean) => void;
    onAddBack: (clothing: SavedClothing) => void;
}

export const ClothingItemCard = memo(({
    clothing,
    isSelected,
    onSelect,
    onDelete,
    onRename,
    onEnlarge,
    onEditMask,
    onAddBack,
}: ClothingItemCardProps) => {
    return (
        <div 
            className={`relative group bg-gray-100 dark:bg-gray-900/50 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-cyan-500 scale-105' : 'hover:shadow-lg hover:scale-102'}`}
            onClick={() => onSelect(clothing)}
        >
            <img 
                src={`data:${clothing.mimeType};base64,${clothing.base64}`} 
                alt={clothing.name} 
                className="w-full h-24 object-cover bg-gray-200 dark:bg-gray-700"
            />
            <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={clothing.name}>{clothing.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{clothing.category}</p>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onEnlarge(`data:${clothing.mimeType};base64,${clothing.base64}`); }} 
                    className="bg-cyan-600 text-white p-2 rounded-full shadow-lg hover:bg-cyan-500 transition-all"
                    title="Ver em tamanho real"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRename(clothing); }} 
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        title="Renomear"
                    >
                        <PencilIcon />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(clothing.id); }} 
                        className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-500 transition-all"
                        title="Deletar"
                    >
                        <TrashIcon />
                    </button>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEditMask(clothing, false); }} 
                        className="bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-500 transition-all"
                        title="Editar Máscara (Frente)"
                    >
                        <PositionIcon />
                    </button>
                    {!clothing.base64Back && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddBack(clothing); }} 
                            className="bg-cyan-600 text-white p-2 rounded-full shadow-lg hover:bg-cyan-500 transition-all"
                            title="Adicionar Imagem das Costas"
                        >
                            <PlusCircleIcon />
                        </button>
                    )}
                    {clothing.base64Back && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditMask(clothing, true); }} 
                            className="bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-500 transition-all"
                            title="Editar Máscara (Costas)"
                        >
                            <PositionIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});
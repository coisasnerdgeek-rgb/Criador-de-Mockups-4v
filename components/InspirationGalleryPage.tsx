import React, { useState, useEffect } from 'react';
import { InspirationSettings } from '../types';
import { inspirationItems } from '../constants';
import { LightbulbIcon, MagicWandIcon, LoadingSpinner } from './Icons';

interface InspirationGalleryPageProps {
    onApplyStyle: (settings: InspirationSettings) => void;
}

export const InspirationGalleryPage: React.FC<InspirationGalleryPageProps> = ({ onApplyStyle }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const initialStates: Record<string, boolean> = {};
        inspirationItems.forEach(item => {
            initialStates[item.id] = true;
        });
        setLoadingStates(initialStates);

        const timers = inspirationItems.map((item, index) => 
            setTimeout(() => {
                setLoadingStates(prev => ({ ...prev, [item.id]: false }));
            }, 500 + index * 300)
        );
        
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
            <div className="text-center">
                <LightbulbIcon className="mx-auto h-16 w-16 text-yellow-400" />
                <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">Galeria de Inspiração</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Não sabe por onde começar? Explore estes estilos e aplique-os ao seu projeto com um único clique.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {inspirationItems.map((item) => {
                    const isLoading = loadingStates[item.id] ?? true;
                    return (
                        <div key={item.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300">
                            {isLoading ? (
                                <div className="w-full h-80 bg-gray-900 flex flex-col items-center justify-center text-center p-4">
                                    <div className="flex items-center gap-3">
                                        <LoadingSpinner className="h-8 w-8 text-cyan-400" />
                                        <span className="text-xl font-semibold text-gray-300">Gerando...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        className="w-full h-80 object-cover animate-fade-in"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-300">Fundo: {item.settings.backgroundTheme}</p>
                                        </div>
                                        <button 
                                            onClick={() => onApplyStyle(item.settings)}
                                            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 hover:bg-cyan-400"
                                        >
                                            <MagicWandIcon /> Usar este Estilo
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
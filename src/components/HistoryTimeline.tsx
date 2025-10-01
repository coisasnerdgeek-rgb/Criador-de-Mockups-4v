import React, { useState, useRef, useEffect } from 'react';
import { HistoryIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface HistoryItem {
    id: string;
    date: string;
    images: string[];
    name: string;
}

interface HistoryTimelineProps {
    history: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onViewAll: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, onRestore, onViewAll }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeItemRef = useRef<HTMLButtonElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const activeHistoryItem = history[currentIndex];

    useEffect(() => {
        // When history changes (e.g., a new item is added), go to the first item.
        setCurrentIndex(0);
    }, [history]);

    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [currentIndex]);

    if (!activeHistoryItem) {
        return null; // Or some placeholder if history is empty
    }
    
    const handlePrev = () => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : history.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev < history.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <HistoryIcon /> Histórico Visual
                </h3>
                <button onClick={onViewAll} className="text-sm text-cyan-400 hover:underline">
                    Ver Tudo
                </button>
            </div>

            {/* Main Preview */}
            <div className="relative mb-4">
                <div className="bg-gray-900/50 rounded-lg p-2 aspect-square grid grid-cols-2 gap-2">
                    {activeHistoryItem.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} alt={`${activeHistoryItem.name} preview ${i+1}`} className="w-full h-full object-cover rounded-md bg-gray-700"/>
                    ))}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button onClick={() => onRestore(activeHistoryItem)} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500">
                        Restaurar
                    </button>
                </div>
            </div>

             <div className="text-center mb-4">
                <p className="font-semibold text-white truncate" title={activeHistoryItem.name}>{activeHistoryItem.name}</p>
                <p className="text-xs text-gray-400">{new Date(activeHistoryItem.date).toLocaleString('pt-BR')}</p>
            </div>

            {/* Timeline Slider */}
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-1 rounded-full bg-gray-700 hover:bg-cyan-500 text-white transition-colors flex-shrink-0">
                    <ChevronLeftIcon />
                </button>
                <div ref={scrollContainerRef} className="flex-grow overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                    <div className="flex items-center gap-4 px-2">
                        {history.map((item, index) => (
                            <button
                                key={item.id}
                                ref={index === currentIndex ? activeItemRef : null}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${currentIndex === index ? 'border-cyan-400 scale-110' : 'border-transparent hover:border-cyan-600'}`}
                            >
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10"></div>
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleNext} className="p-1 rounded-full bg-gray-700 hover:bg-cyan-500 text-white transition-colors flex-shrink-0">
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );
};
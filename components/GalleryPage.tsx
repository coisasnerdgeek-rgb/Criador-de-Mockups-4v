
import React, { useState, useCallback, useMemo, memo } from 'react';
import { HistoryItem } from '../types';
import { Modal } from './Modal';
import { ZoomableImage } from './ZoomableImage';
import { DownloadIcon, GalleryIcon, TrashIcon } from './Icons';

// --- Gallery Page Optimization ---
const GalleryItemCard = memo<{ item: HistoryItem, onSelect: (item: HistoryItem) => void }>(({ item, onSelect }) => {
    const dateString = useMemo(() => new Date(item.date).toLocaleDateString('pt-BR'), [item.date]);

    return (
        <div 
          className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-500 transition-all"
          onClick={() => onSelect(item)}
        >
            <img src={item.images[0]} alt={item.name} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={item.name}>{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.images.length} imagem(ns) • {dateString}</p>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">Ver Lote</span>
            </div>
        </div>
    );
});

const GalleryModalImage = memo<{ img: string, name: string, index: number }>(({ img, name, index }) => {
    const downloadName = useMemo(() => `${name.replace(/\s/g, '_')}-${index+1}.png`, [name, index]);
    return (
        <div className="relative group aspect-square">
            <ZoomableImage src={img} alt={`Imagem ${index + 1}`} />
            <a href={img} download={downloadName} className="absolute bottom-2 right-2 bg-cyan-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title={`Baixar ${downloadName}`}>
                <DownloadIcon />
            </a>
        </div>
    );
});


// --- Gallery Page Component ---
interface GalleryPageProps {
    history: HistoryItem[];
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
    onRestore: (item: HistoryItem) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ history, onDelete, onDeleteAll, onRestore }) => {
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    const handleDeleteItem = useCallback((id: string, name: string) => {
      if (window.confirm(`Tem certeza de que deseja excluir o lote "${name}"? Esta ação não pode ser desfeita.`)) {
          onDelete(id);
          if (selectedItem?.id === id) {
            setSelectedItem(null);
          }
      }
    }, [onDelete, selectedItem]);

    const handleSelectItem = useCallback((item: HistoryItem) => {
        setSelectedItem(item);
    }, []);

    const handleDeleteAll = useCallback(() => {
        if (window.confirm("Tem certeza que deseja limpar permanentemente toda a galeria? Esta ação não pode ser desfeita.")) {
            onDeleteAll();
        }
    }, [onDeleteAll]);

    if (history.length === 0) {
      return (
        <div className="text-center py-20">
          <GalleryIcon className="mx-auto h-24 w-24 text-gray-500 dark:text-gray-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-300">Sua Galeria está vazia</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-500">Volte para o criador para gerar seus primeiros mockups!</p>
        </div>
      );
    }

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Galeria de Gerações</h1>
                <button onClick={handleDeleteAll} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-red-500 transition-colors">
                    <TrashIcon /> Limpar Galeria
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {history.map(item => (
                    <GalleryItemCard key={item.id} item={item} onSelect={handleSelectItem} />
                ))}
            </div>
            {selectedItem && (
                <Modal onClose={() => setSelectedItem(null)} title={selectedItem.name}>
                    <div className="max-h-[75vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {selectedItem.images.map((img, i) => (
                                <GalleryModalImage key={i} img={img} name={selectedItem.name} index={i} />
                            ))}
                        </div>
                    </div>
                     <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-end gap-4">
                        <button onClick={() => handleDeleteItem(selectedItem.id, selectedItem.name)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500">Deletar Lote</button>
                        <button onClick={() => onRestore(selectedItem)} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500">Restaurar na Tela Principal</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

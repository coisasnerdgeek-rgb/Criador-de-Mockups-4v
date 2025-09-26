import React from 'react';
import { Modal } from './Modal';
import { HistoryItem } from '../types';
import { TrashIcon, XIcon } from './Icons'; // Added XIcon


interface HistoryModalProps {
    history: HistoryItem[];
    onClose: () => void;
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
    onRestore: (item: HistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onDelete, onDeleteAll, onRestore }) => {
    return (
        <Modal onClose={onClose} title="Histórico de Gerações">
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500 dark:text-gray-400">{history.length} registro(s) no histórico.</p>
                <button onClick={onDeleteAll} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-red-500 transition-colors">
                    <TrashIcon /> Limpar Tudo
                </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-2">
                {history.length > 0 ? history.map(item => (
                    <div key={item.id} className="bg-gray-100/50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                        <div className="flex-shrink-0 grid grid-cols-2 gap-1">
                            {item.images.slice(0, 4).map((img, i) => (
                                <img key={i} src={img} className="w-16 h-16 rounded-md object-cover bg-gray-200 dark:bg-gray-700"/>
                            ))}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                {' às '}
                                {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                 • {item.images.length} imagem(ns)
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => onRestore(item)} className="bg-cyan-600 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-cyan-500 w-full">Restaurar</button>
                            <button onClick={() => onDelete(item.id)} className="bg-gray-500 dark:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 w-full">Deletar</button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-500 py-10">Seu histórico está vazio.</p>
                )}
            </div>
        </Modal>
    );
};
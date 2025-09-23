
import React, { useState } from 'react';
import { Modal } from './Modal';
import { SavedClothing } from '../types';

interface EditClothingNameModalProps {
    clothing: SavedClothing;
    onSave: (clothingId: string, newName: string) => string | null;
    onClose: () => void;
}

export const EditClothingNameModal: React.FC<EditClothingNameModalProps> = ({ clothing, onSave, onClose }) => {
    const [name, setName] = useState(clothing.name);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const resultError = onSave(clothing.id, name);
        if (!resultError) {
          onClose();
        } else {
          setError(resultError);
        }
    };

    return (
        <Modal onClose={onClose} title={`Renomear: ${clothing.name}`}>
            <div className="max-w-md mx-auto">
                <div className="space-y-4">
                    <label htmlFor="edit-clothing-name-input" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Novo nome da roupa</label>
                    <input
                        id="edit-clothing-name-input"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className={`w-full bg-gray-100 dark:bg-gray-700 border text-gray-800 dark:text-white rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <button onClick={onClose} className="bg-gray-500 dark:bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors">Salvar</button>
                </div>
            </div>
        </Modal>
    );
};

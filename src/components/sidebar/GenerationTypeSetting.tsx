import React from 'react';
import { GenerationType } from '../../types';
import { PersonIcon, PosesIcon, UsersIcon } from '@/components/Icons';

interface GenerationTypeSettingProps {
    generationType: GenerationType;
    setGenerationType: React.Dispatch<React.SetStateAction<GenerationType>>;
}

export const GenerationTypeSetting: React.FC<GenerationTypeSettingProps> = ({
    generationType,
    setGenerationType,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block">Tipo de Geração</label>
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setGenerationType('standard')} className={`p-2 text-sm rounded-md ${generationType === 'standard' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <PersonIcon className="mx-auto mb-1 h-5 w-5" /> Padrão
                </button>
                <button onClick={() => setGenerationType('poses-3')} className={`p-2 text-sm rounded-md ${generationType === 'poses-3' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <PosesIcon className="mx-auto mb-1 h-5 w-5" /> Poses
                </button>
                <button onClick={() => setGenerationType('models')} className={`p-2 text-sm rounded-md ${generationType === 'models' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <UsersIcon className="mx-auto mb-1 h-5 w-5" /> Modelos
                </button>
            </div>
        </div>
    );
};
import React from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { PromptSettings } from '../types';
import { ImageIcon, PlusCircleIcon, NoBackgroundIcon } from '@/components/Icons';

interface BackgroundSettingProps {
    backgroundTheme: string;
    setBackgroundTheme: React.Dispatch<React.SetStateAction<string>>;
    customBackgroundFile: File | null;
    setCustomBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
    promptSettings: PromptSettings;
    customBgState: { isLoading: boolean; error: string | null; };
    handleCustomBackgroundFileChange: (file: File) => Promise<void>;
}

export const BackgroundSetting: React.FC<BackgroundSettingProps> = ({
    backgroundTheme,
    setBackgroundTheme,
    customBackgroundFile,
    setCustomBackgroundFile,
    promptSettings,
    customBgState,
    handleCustomBackgroundFileChange,
}) => {
    const themes = Object.keys(promptSettings.backgrounds);

    return (
        <div className="space-y-4">
            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block flex items-center gap-2">
                <ImageIcon /> Fundo
            </label>
            <div className="grid grid-cols-2 gap-2">
                {themes.map(theme => (
                    <button
                        key={theme}
                        onClick={() => { setBackgroundTheme(theme); setCustomBackgroundFile(null); }}
                        className={`p-2 text-sm rounded-md transition-colors flex items-center justify-center gap-1 ${backgroundTheme === theme ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        {theme === 'Sem Fundo' && <NoBackgroundIcon className="h-4 w-4" />}
                        {theme}
                    </button>
                ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Fundo Personalizado</h3>
                <ImageUploader
                    title=""
                    onImageUpload={handleCustomBackgroundFileChange}
                    previewUrl={customBackgroundFile ? URL.createObjectURL(customBackgroundFile) : null}
                    isLoading={customBgState.isLoading}
                    error={customBgState.error}
                    onClear={() => { setCustomBackgroundFile(null); setBackgroundTheme(themes[0]); }}
                />
            </div>
        </div>
    );
};
import React from 'react';
import { ImageUploader } from '../ImageUploader';
import { PromptSettings } from '../../types';
import { ImageIcon } from '../Icons';

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
    return (
        <div className="space-y-2">
            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block flex items-center gap-2">
                <ImageIcon /> Fundo
            </label>
            <select
                value={backgroundTheme}
                onChange={e => { setBackgroundTheme(e.target.value); setCustomBackgroundFile(null); }}
                className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2 mb-2"
            >
                {Object.keys(promptSettings.backgrounds).map(theme => <option key={theme} value={theme}>{theme}</option>)}
                {customBackgroundFile && <option value="Personalizado">Personalizado</option>}
            </select>
            <ImageUploader
                title=""
                onImageUpload={handleCustomBackgroundFileChange}
                previewUrl={customBackgroundFile ? URL.createObjectURL(customBackgroundFile) : null}
                isLoading={customBgState.isLoading}
                error={customBgState.error}
                onClear={() => { setCustomBackgroundFile(null); setBackgroundTheme(Object.keys(promptSettings.backgrounds)[0]); }}
            />
        </div>
    );
};
import React from 'react';
import { AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon } from '../Icons';

interface AspectRatioSettingProps {
    generationAspectRatio: string;
    setGenerationAspectRatio: React.Dispatch<React.SetStateAction<string>>;
}

export const AspectRatioSetting: React.FC<AspectRatioSettingProps> = ({
    generationAspectRatio,
    setGenerationAspectRatio,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block">Proporção da Imagem</label>
            <div className="grid grid-cols-5 gap-2 text-gray-800 dark:text-white">
                <button onClick={() => setGenerationAspectRatio('1:1')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '1:1' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="1:1 (Quadrado)">
                    <AspectRatioOneOneIcon />
                </button>
                <button onClick={() => setGenerationAspectRatio('3:4')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '3:4' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="3:4 (Retrato)">
                    <AspectRatioThreeFourIcon />
                </button>
                <button onClick={() => setGenerationAspectRatio('4:3')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '4:3' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="4:3 (Paisagem)">
                    <AspectRatioFourThreeIcon />
                </button>
                <button onClick={() => setGenerationAspectRatio('9:16')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="9:16 (Retrato Widescreen)">
                    <AspectRatioNineSixteenIcon />
                </button>
                <button onClick={() => setGenerationAspectRatio('16:9')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="16:9 (Paisagem Widescreen)">
                    <AspectRatioSixteenNineIcon />
                </button>
            </div>
        </div>
    );
};
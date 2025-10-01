import React, { useState } from 'react';
import { LoadingSpinner, MagicWandIcon, ZipIcon, PersonIcon, PosesIcon, UsersIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, PaletteIcon, LayersIcon, ImageIcon } from '@/components/Icons';
import { GenerationType, GenerationMode, Pose, ModelFilter, PromptSettings, ColorPalette, Print, SavedClothing } from '../../types';
import { GenerationTypeSetting } from './GenerationTypeSetting';
import { AspectRatioSetting } from './AspectRatioSetting';
import { GenerationModeSetting } from './GenerationModeSetting';
import { ColorSetting } from './ColorSetting';
import { BlendModeSetting } from './BlendModeSetting';
import { BackgroundSetting } from './BackgroundSetting';
import { GenerateActions } from './GenerateActions';

// Define the type for sidebar setting tabs
type SidebarSettingTab = 'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background';

interface CreatorGenerationOptionsAndActionsSectionProps {
    generationProps: {
        generationType: GenerationType;
        setGenerationType: React.Dispatch<React.SetStateAction<GenerationType>>;
        generationAspectRatio: string;
        setGenerationAspectRatio: React.Dispatch<React.SetStateAction<string>>;
        generationMode: GenerationMode;
        setGenerationMode: React.Dispatch<React.SetStateAction<GenerationMode>>;
        selectedColor: string | null;
        setSelectedColor: React.Dispatch<React.SetStateAction<string | null>>;
        customColors: string[];
        handleAddCustomColor: (color: string) => void;
        blendMode: string;
        setBlendMode: React.Dispatch<React.SetStateAction<string>>;
        backgroundTheme: string;
        setBackgroundTheme: React.Dispatch<React.SetStateAction<string>>;
        customBackgroundFile: File | null;
        setCustomBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
        selectedPoses: Pose[];
        handlePoseSelection: (pose: Pose) => void;
        modelFilter: ModelFilter;
        setModelFilter: React.Dispatch<React.SetStateAction<ModelFilter>>;
        promptSettings: PromptSettings;
        customBgState: { isLoading: boolean; error: string | null; };
        handleCustomBackgroundFileChange: (file: File) => Promise<void>;
        selectedClothing: SavedClothing | null;
        handleGenerateBackground: () => Promise<void>;
        isGeneratingBackground: boolean;
        handleRevertBackground: () => void;
        handleSuggestColors: () => Promise<void>;
        isSuggestingColors: boolean;
        suggestedPalettes: ColorPalette[] | null;
    };
    actionsProps: {
        isLoading: boolean;
        isBatchingPreviews: boolean;
        error: string | null;
        handleGenerate: () => Promise<void>;
        handleGenerateAssociationsBatch: () => Promise<void>;
        canGenerate: boolean;
    };
    printsProps: {
        selectedPrintFront: Print | undefined;
    };
}

export const CreatorGenerationOptionsAndActionsSection: React.FC<CreatorGenerationOptionsAndActionsSectionProps> = ({
    generationProps,
    actionsProps,
    printsProps,
}) => {
    const [activeSettingTab, setActiveSettingTab] = useState<SidebarSettingTab>('generationType');
    
    const { selectedClothing } = generationProps;
    const { selectedPrintFront } = printsProps;

    const colorSettingProps = {
        ...generationProps,
        selectedClothing: generationProps.selectedClothing,
        selectedPrintFront: selectedPrintFront,
    };

    const renderSettingContent = () => {
        switch (activeSettingTab) {
            case 'generationType':
                return <GenerationTypeSetting {...generationProps} />;
            case 'aspectRatio':
                return <AspectRatioSetting {...generationProps} />;
            case 'generationMode':
                return <GenerationModeSetting {...generationProps} />;
            case 'color':
                return <ColorSetting {...colorSettingProps} />;
            case 'blendMode':
                return <BlendModeSetting {...generationProps} />;
            case 'background':
                return <BackgroundSetting {...generationProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Setting Tabs (buttons) */}
            <div className="flex flex-col space-y-2 p-4 border-b border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setActiveSettingTab('generationType')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'generationType' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <PersonIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Tipo de Geração</span>
                </button>
                <button 
                    onClick={() => setActiveSettingTab('aspectRatio')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'aspectRatio' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <AspectRatioOneOneIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Proporção da Imagem</span>
                </button>
                <button 
                    onClick={() => setActiveSettingTab('generationMode')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'generationMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <UsersIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Lados para Gerar</span>
                </button>
                <button 
                    onClick={() => setActiveSettingTab('color')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'color' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <PaletteIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Cor da Roupa</span>
                </button>
                <button 
                    onClick={() => setActiveSettingTab('blendMode')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'blendMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <LayersIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Modo de Mesclagem</span>
                </button>
                <button 
                    onClick={() => setActiveSettingTab('background')} 
                    className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${activeSettingTab === 'background' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                >
                    <ImageIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">Fundo</span>
                </button>
            </div>

            {/* Render active setting content */}
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700 dark:scrollbar-track-900 p-4 space-y-4">
                {renderSettingContent()}
            </div>

            {/* Actions (fixed at the bottom) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <GenerateActions {...actionsProps} />
            </div>
        </div>
    );
};
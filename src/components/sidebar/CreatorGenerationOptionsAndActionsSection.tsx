import React from 'react';
import { LoadingSpinner, MagicWandIcon, ZipIcon, PersonIcon, PosesIcon, UsersIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, PaletteIcon, LayersIcon, ImageIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { GenerationType, GenerationMode, Pose, ModelFilter, PromptSettings, ColorPalette, Print, SavedClothing } from '../../types';
import { ColorPicker } from '@/components/ColorPicker';
import { ImageUploader } from '@/components/ImageUploader';
import { GenerationTypeSetting } from './GenerationTypeSetting';
import { AspectRatioSetting } from './AspectRatioSetting';
import { GenerationModeSetting } from './GenerationModeSetting';
import { ColorSetting } from './ColorSetting';
import { BlendModeSetting } from './BlendModeSetting';
import { BackgroundSetting } from './BackgroundSetting';


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
    activeSettingTab: 'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background';
}

export const CreatorGenerationOptionsAndActionsSection: React.FC<CreatorGenerationOptionsAndActionsSectionProps> = ({
    generationProps,
    printsProps,
    activeSettingTab,
}) => {
    const { selectedClothing, selectedPrintFront } = printsProps; // Destructure selectedClothing from printsProps
    
    // Pass selectedClothing and selectedPrintFront to ColorSetting
    const colorSettingProps = {
        ...generationProps,
        selectedClothing: generationProps.selectedClothing, // Ensure selectedClothing is passed
        selectedPrintFront: selectedPrintFront, // Pass selectedPrintFront
    };

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
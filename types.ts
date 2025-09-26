import React from 'react';

export interface Mask {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  skewX?: number;
  skewY?: number;
}

export type SavedMask = Mask & { name: string; id: string; };

export interface CombinationSlot {
  id: string;
  type: 'front' | 'back';
  printId: string | null;
}
export interface PrintCombination {
  id: string;
  name: string;
  slots: CombinationSlot[];
}

export interface SavedImagePrompt {
  id: string;
  name: string;
  prompt: string;
}

export interface SavedClothing {
  id: string;
  name: string;
  category: string;
  // Front
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  mask: Mask | null;
  originalBase64?: string; // For non-destructive background generation
  imageUrl?: string;
  // Back
  base64Back?: string;
  mimeTypeBack?: string;
  widthBack?: number;
  heightBack?: number;
  maskBack?: Mask | null;
  imageUrlBack?: string;
  // New association model
  printCombinations: PrintCombination[];
  isMinimizedInAssociations: boolean;
}

export interface Print {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
  hasBgRemoved: boolean;
}

export interface HistoryItem {
    id: string;
    date: string;
    images: string[];
    name: string;
}

export interface TreatmentHistoryItem {
  id: string;
  date: string;
  originalPrintId: string | null;
  generatedImage: { base64: string; mimeType: string };
  prompt: string;
  additionalImages: Print[];
}

// --- New type definitions for CreatorPage ---
export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
// --- End new type definitions ---


// --- Robust Type Definitions ---
export type GenerationType = 'standard' | 'poses-3' | 'models';
export type GenerationMode = 'front' | 'back' | 'both';
export type Pose = 'Frente' | 'Meio de lado' | 'De lado' | 'Costas';
export type ActivePage = 'creator' | 'gallery' | 'associations' | 'settings' | 'treatment' | 'inspiration';
export type ImportStatus = { message: string; error: boolean; progress?: number };
export type ActiveNewClothingInputTab = 'file' | 'url';

export interface ModelFilter {
  gender: string;
  age: string;
  ethnicity: string;
}

export interface ClothingToMask {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  isBack: boolean;
}

export interface ClothingToEdit {
  clothing: SavedClothing;
  isBack: boolean;
}

export interface FileUploadState {
  isLoading: boolean;
  error: string | null;
  previewUrl?: string | null;
}

export interface NewClothingFileState {
  front: FileUploadState;
  back: FileUploadState;
}

export interface NewClothingForm {
    file: File | null;
    fileBack: File | null;
    url: string;
    urlBack: string;
    name: string;
    category: string;
    nameError: string | null;
}

export interface BatchGenerationStatus {
  isActive: boolean;
  progress: number;
  total: number;
  currentItem: string;
  completed: number;
  failed: number;
}


// --- Prompts Structure ---
export interface MockupPrompts {
    basePrompt: string;
    basePromptNoPrint: string;
    backWithReferencePrompt: string;
    poseVariationPrompt: string;
    standardFrontViewPrompt: string;
    standardBackViewPrompt: string;
    colorInstruction: string;
    noColorInstruction: string;
}

export interface PromptSettings {
  mockup: MockupPrompts;
  backgrounds: { [key: string]: string };
  poses: Record<Pose, string>;
}

// --- New Feature Types ---
export interface InspirationSettings {
    generationType: GenerationType;
    generationAspectRatio: string;
    generationMode: GenerationMode;
    selectedColor: string | null;
    blendMode: string;
    backgroundTheme: string;
    selectedPoses: Pose[];
    modelFilter: ModelFilter;
}

export interface InspirationItem {
    id: string;
    name: string;
    imageUrl: string;
    settings: InspirationSettings;
}

export interface ColorPalette {
    paletteName: string;
    colors: string[];
}

// --- Prop Interfaces for CreatorPage sections ---
export interface CreatorPageClothingProps {
    savedClothes: SavedClothing[];
    selectedClothing: SavedClothing | null;
    setSelectedClothing: React.Dispatch<React.SetStateAction<SavedClothing | null>>;
    activeCategory: string;
    setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
    clothingCategories: string[];
    filteredClothes: SavedClothing[];
    newClothingForm: NewClothingForm;
    setNewClothingForm: React.Dispatch<React.SetStateAction<NewClothingForm>>;
    newClothingFileState: NewClothingFileState;
    handleNewClothingFileChange: (file: File, isBack: boolean) => Promise<void>;
    handleClearNewClothingFile: (isBack: boolean) => void;
    handleLoadFromUrl: (url: string, isBack: boolean) => Promise<void>;
    activeNewClothingTab: 'saved' | 'new';
    setActiveNewClothingTab: React.Dispatch<React.SetStateAction<'saved' | 'new'>>;
    activeNewClothingInputTab: ActiveNewClothingInputTab;
    setActiveNewClothingInputTab: React.Dispatch<React.SetStateAction<ActiveNewClothingInputTab>>;
    editingClothingName: SavedClothing | null;
    setEditingClothingName: React.Dispatch<React.SetStateAction<SavedClothing | null>>;
    handleDeleteClothing: (id: string) => void;
    handleAddBackImage: (clothing: SavedClothing) => void;
    handleOpenMaskEditorForNew: (isBack: boolean) => Promise<void>;
    handleOpenMaskEditorForEdit: (clothing: SavedClothing, isBack: boolean) => void;
    setEnlargedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface CreatorPagePrintsProps {
    savedPrints: Print[];
    printsToShow: Print[];
    selectedPrintId: string | null;
    setSelectedPrintId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedPrintIdBack: string | null;
    setSelectedPrintIdBack: React.Dispatch<React.SetStateAction<string | null>>;
    printUploadError: string | null;
    handlePrintFilesChange: (files: FileList) => Promise<void>;
    handleDeletePrint: (id: string) => void;
    handleRemovePrintBg: (printId: string) => Promise<void>;
    isRemovingBackground: boolean;
    selectedClothing: SavedClothing | null;
    setEnlargedImage: React.Dispatch<React.SetStateAction<string | null>>;
    selectedPrintFront: Print | undefined;
}

export interface CreatorPageGenerationProps {
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
}

export interface CreatorPageActionsProps {
    isLoading: boolean;
    isBatchingPreviews: boolean;
    error: string | null;
    handleGenerate: () => Promise<void>;
    handleGenerateAssociationsBatch: () => Promise<void>;
    canGenerate: boolean;
    handleDownloadPreviewsAsZip: () => Promise<void>;
    isZippingPreview: boolean;
}

export interface CreatorPageUIProps {
    precompositePreviewUrl: string | null;
    precompositePreviewUrlBack: string | null;
    precompositePreviewUrlBefore: string | null;
    setEnlargedImage: React.Dispatch<React.SetStateAction<string | null>>;
    handleOpenMaskEditorForEdit: (clothing: SavedClothing, isBack: boolean) => void;
    handleDownloadPreview: (url: string | null, side: 'frente' | 'costas') => void;
    handleSavePreviewToHistory: (side: 'front' | 'back') => void;
}

export interface CreatorPageProps {
    clothingProps: CreatorPageClothingProps;
    printsProps: CreatorPagePrintsProps;
    generationProps: CreatorPageGenerationProps;
    actionsProps: CreatorPageActionsProps;
    uiProps: CreatorPageUIProps;
    generationHistory: HistoryItem[];
    handleRestoreHistoryItem: (item: HistoryItem) => void;
    setIsHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    generatedImageUrls: string[];
    setGeneratedImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
}
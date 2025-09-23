



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
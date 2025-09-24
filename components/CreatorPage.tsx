import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { ImageUploader } from './ImageUploader';
import { HistoryTimeline } from './HistoryTimeline';
import { ZoomableImage } from './ZoomableImage';
import { ImageCompareSlider } from './ImageCompareSlider';

// Import new components
import { ClothingItemCard } from './ClothingItemCard';
import { PrintItemCard } from './PrintItemCard';

import { 
    SavedClothing, Print, Mask, HistoryItem, GenerationType, GenerationMode, Pose, ModelFilter, 
    PromptSettings, NewClothingFileState, ActiveNewClothingInputTab, NewClothingForm, ColorPalette,
    ImageDimensions, ImageRect // Import new types
} from '../types';
import { 
    LoadingSpinner, TrashIcon, PencilIcon, MagicWandIcon, DownloadIcon, ImageIcon, HistoryIcon, 
    PersonIcon, PosesIcon, UploadIcon, ZipIcon, PositionIcon, ZoomInIcon, LayersIcon, 
    UsersIcon, PaletteIcon, NoBackgroundIcon, ClothingIcon, TagIcon, BookmarkIcon, PlusCircleIcon, 
    MinusCircleIcon, ResetIcon, RevertIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, 
    AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, ChevronLeftIcon, ChevronRightIcon
} from './Icons';

// Import new sidebar components
import { CreatorGenerationOptionsAndActionsSection } from './sidebar/CreatorGenerationOptionsAndActionsSection.tsx';
import { GenerationTypeSetting } from './sidebar/GenerationTypeSetting.tsx';
import { AspectRatioSetting } from './sidebar/AspectRatioSetting.tsx';
import { GenerationModeSetting } from './sidebar/GenerationModeSetting.tsx';
import { ColorSetting } from './sidebar/ColorSetting.tsx';
import { BlendModeSetting } from './sidebar/BlendModeSetting.tsx';
import { BackgroundSetting } from './sidebar/BackgroundSetting.tsx';
import { GenerateActions } from './sidebar/GenerateActions.tsx';


// --- Type Definitions ---

interface PreviewToolbarProps {
    generationType: GenerationType;
    setGenerationType: React.Dispatch<React.SetStateAction<GenerationType>>;
    backgroundTheme: string;
    setBackgroundTheme: React.Dispatch<React.SetStateAction<string>>;
    promptSettings: PromptSettings;
    customBackgroundFile: File | null;
    setCustomBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
    handleGenerateBackground: () => Promise<void>;
    isGeneratingBackground: boolean;
    selectedClothing: SavedClothing | null;
    handleRevertBackground: () => void;
    handleDownloadPreview: (url: string | null, side: 'frente' | 'costas') => void;
    precompositePreviewUrl: string | null;
    handleSavePreviewToHistory: (side: 'front' | 'back') => void;
    handleOpenMaskEditorForEdit: (clothing: SavedClothing, isBack: boolean) => void;
    handleAddBackImage: (clothing: SavedClothing) => void;
    isBackPreview: boolean; // New prop to differentiate front/back toolbar
}

const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    generationType, setGenerationType, backgroundTheme, setBackgroundTheme,
    promptSettings, customBackgroundFile, setCustomBackgroundFile,
    handleGenerateBackground, isGeneratingBackground, selectedClothing,
    handleRevertBackground, handleDownloadPreview, precompositePreviewUrl,
    handleSavePreviewToHistory, handleOpenMaskEditorForEdit, handleAddBackImage,
    isBackPreview
}) => (
    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/70 dark:bg-gray-900/70 p-2 rounded-lg shadow-lg flex flex-col gap-2" onClick={e => e.stopPropagation()}>
            <select
                value={generationType}
                onChange={(e) => { e.stopPropagation(); setGenerationType(e.target.value as GenerationType); }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs p-1 rounded border border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                title="Mudar Tipo de Geração"
            >
                <option value="standard">Padrão</option>
                <option value="poses-3">Poses</option>
                <option value="models">Modelos</option>
            </select>
            <select
                value={backgroundTheme}
                onChange={(e) => {
                    e.stopPropagation();
                    setBackgroundTheme(e.target.value);
                    if (e.target.value !== 'Personalizado') setCustomBackgroundFile(null);
                }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs p-1 rounded border border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                title="Mudar Fundo"
            >
                {Object.keys(promptSettings.backgrounds).map(theme => <option key={theme} value={theme}>{theme}</option>)}
                {customBackgroundFile && <option value="Personalizado">Personalizado</option>}
            </select>
            <div className="flex justify-around items-center gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); handleGenerateBackground(); }}
                    disabled={isGeneratingBackground || backgroundTheme === 'Sem Fundo'}
                    className="bg-green-600 text-white px-2 py-1 text-xs rounded-md hover:bg-green-500 transition-all self-center w-full flex items-center justify-center gap-1 disabled:bg-gray-500 dark:disabled:bg-gray-600"
                    title="Gerar Fundo com IA"
                >
                    {isGeneratingBackground ? <LoadingSpinner className="h-4 w-4"/> : <MagicWandIcon className="h-4 w-4"/>} Gerar
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setGenerationType('standard');
                        setBackgroundTheme(Object.keys(promptSettings.backgrounds)[0]);
                        setCustomBackgroundFile(null);
                    }}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all self-center"
                    title="Resetar Configurações"
                >
                    <ResetIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
        {selectedClothing?.originalBase64 && (
            <button onClick={(e) => { e.stopPropagation(); handleRevertBackground(); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all" title="Reverter para Original">
                <RevertIcon className="h-5 w-5" />
            </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); handleDownloadPreview(precompositePreviewUrl, isBackPreview ? 'costas' : 'frente'); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title={`Baixar Pré-visualização (${isBackPreview ? 'Costas' : 'Frente'})`}>
            <DownloadIcon className="h-5 w-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleSavePreviewToHistory(isBackPreview ? 'back' : 'front'); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all" title="Salvar Prévia no Histórico">
            <BookmarkIcon className="h-5 w-5" />
        </button>
        {selectedClothing && (
            <button onClick={(e) => { e.stopPropagation(); handleOpenMaskEditorForEdit(selectedClothing, isBackPreview); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-purple-600 hover:scale-110 transition-all" title={`Editar Área da Estampa (${isBackPreview ? 'Costas' : 'Frente'})`}>
            <PositionIcon className="h-5 w-5" />
            </button>
        )}
        {selectedClothing && !selectedClothing.base64Back && !isBackPreview && (
            <button onClick={(e) => { e.stopPropagation(); handleAddBackImage(selectedClothing); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title="Adicionar Costas">
                <PlusCircleIcon className="h-5 w-5" />
            </button>
        )}
    </div>
);


const useImageRect = (containerRef: React.RefObject<HTMLDivElement>, imageDimensions: ImageDimensions | null) => {
    const [imageRect, setImageRect] = useState<ImageRect | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (!entries[0] || !imageDimensions) {
                setImageRect(null);
                return;
            }
            const { width: cWidth, height: cHeight } = entries[0].contentRect;
            const { width: iWidth, height: iHeight } = imageDimensions;

            const cRatio = cWidth / cHeight;
            const iRatio = iWidth / iHeight;

            let renderedW, renderedH, x, y;
            if (iRatio > cRatio) {
                renderedW = cWidth;
                renderedH = cWidth / iRatio;
                x = 0;
                y = (cHeight - renderedH) / 2;
            } else {
                renderedH = cHeight;
                renderedW = cHeight * iRatio;
                x = (cWidth - renderedW) / 2;
                y = 0;
            }
            setImageRect({ x, y, width: renderedW, height: renderedH });
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [containerRef, imageDimensions]);

    return imageRect;
};


const MaskOverlay: React.FC<{ mask: Mask | null; imageRect: ImageRect | null }> = ({ mask, imageRect }) => {
    if (!mask || !imageRect) {
        return null;
    }

    const maskStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${imageRect.x + mask.x * imageRect.width}px`,
        top: `${imageRect.y + mask.y * imageRect.height}px`,
        width: `${mask.width * imageRect.width}px`,
        height: `${mask.height * imageRect.height}px`,
        transform: `rotate(${mask.rotation}deg)`,
        transformOrigin: 'center center',
        border: '2px dashed #6B7280', // border-gray-500
        borderRadius: '0.5rem', // rounded-lg
        pointerEvents: 'none',
    };

    return <div style={maskStyle} aria-hidden="true" />;
};

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
    setBackgroundTheme: React.SetStateAction<string>; // Changed to React.SetStateAction
    customBackgroundFile: File | null;
    setCustomBackgroundFile: React.SetStateAction<File | null>; // Changed to React.SetStateAction
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
// --- End Prop Interfaces ---


const CreatorClothingSection = memo((props: CreatorPageClothingProps) => {
    const {
        selectedClothing, setSelectedClothing, activeCategory, setActiveCategory, clothingCategories, 
        filteredClothes, activeNewClothingTab, setActiveNewClothingTab, activeNewClothingInputTab, 
        setActiveNewClothingInputTab, newClothingFileState, handleNewClothingFileChange, 
        handleClearNewClothingFile, newClothingForm, setNewClothingForm, handleLoadFromUrl, 
        handleOpenMaskEditorForNew, handleDeleteClothing, setEditingClothingName, setEnlargedImage, 
        handleOpenMaskEditorForEdit, handleAddBackImage
    } = props;

    const { name: newClothingName, category: newClothingCategory, nameError: newClothingNameError, url: newClothingUrl, urlBack: newClothingUrlBack } = newClothingForm;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-cyan-500 dark:text-cyan-400 flex items-center gap-2"><ClothingIcon /> Inserir Roupas</h2>
            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                <button onClick={() => setActiveNewClothingTab('saved')} className={`py-2 px-4 font-semibold ${activeNewClothingTab === 'saved' ? 'text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>Salvas</button>
                <button onClick={() => setActiveNewClothingTab('new')} className={`py-2 px-4 font-semibold ${activeNewClothingTab === 'new' ? 'text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>Nova Roupa</button>
            </div>
            {activeNewClothingTab === 'new' ? (
                <div className="space-y-4 animate-fade-in flex-grow"> {/* Removed overflow-y-auto */}
                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        <button onClick={() => setActiveNewClothingInputTab('file')} className={`flex-1 py-2 text-sm rounded-md ${activeNewClothingInputTab === 'file' ? 'bg-cyan-600 text-white' : ''}`}>Upload de Arquivo</button>
                        <button onClick={() => setActiveNewClothingInputTab('url')} className={`flex-1 py-2 text-sm rounded-md ${activeNewClothingInputTab === 'url' ? 'bg-cyan-600 text-white' : ''}`}>Usar URL</button>
                    </div>

                    {activeNewClothingInputTab === 'file' ? (
                        <>
                            <ImageUploader title="Frente da Roupa (Obrigatório)" onImageUpload={(file) => handleNewClothingFileChange(file, false)} previewUrl={newClothingFileState.front.previewUrl} isLoading={newClothingFileState.front.isLoading} error={newClothingFileState.front.error} onClear={() => handleClearNewClothingFile(false)} />
                            <ImageUploader title="Costas da Roupa (Opcional)" onImageUpload={(file) => handleNewClothingFileChange(file, true)} previewUrl={newClothingFileState.back.previewUrl} isLoading={newClothingFileState.back.isLoading} error={newClothingFileState.back.error} onClear={() => handleClearNewClothingFile(true)} />
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-100/50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <label htmlFor="clothing-url-front" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">URL da Frente (Obrigatório)</label>
                                <div className="flex gap-2">
                                    <input id="clothing-url-front" type="text" value={newClothingUrl} onChange={e => setNewClothingForm(prev => ({...prev, url: e.target.value}))} placeholder="https://..." className="w-full bg-gray-200 dark:bg-gray-700 border text-gray-800 dark:text-white rounded-md p-2 border-gray-300 dark:border-gray-600" />
                                    <button onClick={() => handleLoadFromUrl(newClothingUrl, false)} disabled={!newClothingUrl || newClothingFileState.front.isLoading} className="bg-cyan-600 text-white font-bold px-4 rounded-md hover:bg-cyan-500 disabled:bg-gray-500 dark:disabled:bg-gray-600">{newClothingFileState.front.isLoading ? <LoadingSpinner/> : 'Carregar'}</button>
                                </div>
                                {newClothingFileState.front.previewUrl && <img src={newClothingFileState.front.previewUrl} alt="Preview" className="mt-2 rounded-md max-h-40 mx-auto"/>}
                                {newClothingFileState.front.error && <p className="text-red-400 text-sm mt-1">{newClothingFileState.front.error}</p>}
                            </div>
                            <div className="bg-gray-100/50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <label htmlFor="clothing-url-back" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">URL das Costas (Opcional)</label>
                                <div className="flex gap-2">
                                    <input id="clothing-url-back" type="text" value={newClothingUrlBack} onChange={e => setNewClothingForm(prev => ({...prev, urlBack: e.target.value}))} placeholder="https://..." className="w-full bg-gray-200 dark:bg-gray-700 border text-gray-800 dark:text-white rounded-md p-2 border-gray-300 dark:border-gray-600" />
                                    <button onClick={() => handleLoadFromUrl(newClothingUrlBack, true)} disabled={!newClothingUrlBack || newClothingFileState.back.isLoading} className="bg-cyan-600 text-white font-bold px-4 rounded-md hover:bg-cyan-500 disabled:bg-gray-500 dark:disabled:bg-gray-600">{newClothingFileState.back.isLoading ? <LoadingSpinner/> : 'Carregar'}</button>
                                </div>
                                {newClothingFileState.back.previewUrl && <img src={newClothingFileState.back.previewUrl} alt="Preview" className="mt-2 rounded-md max-h-40 mx-auto"/>}
                                {newClothingFileState.back.error && <p className="text-red-400 text-sm mt-1">{newClothingFileState.back.error}</p>}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="clothing-name" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><PencilIcon className="h-5 w-5" /> Nome da Roupa</label>
                        <input id="clothing-name" type="text" value={newClothingName} onChange={e => setNewClothingForm(prev => ({...prev, name: e.target.value, nameError: null}))} placeholder="Ex: Camiseta Básica" className={`w-full bg-gray-200 dark:bg-gray-700 border text-gray-800 dark:text-white rounded-md p-2 ${newClothingNameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {newClothingNameError && <p className="text-red-400 text-sm mt-1">{newClothingNameError}</p>}
                    </div>
                    <div>
                        <label htmlFor="clothing-category" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><TagIcon /> Categoria</label>
                        <select id="clothing-category" value={newClothingCategory} onChange={e => setNewClothingForm(prev => ({...prev, category: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2">
                        {clothingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <button onClick={() => handleOpenMaskEditorForNew(false)} disabled={!newClothingForm.file || !newClothingName.trim()} className="w-full bg-cyan-600 text-white font-bold py-2 rounded-md hover:bg-cyan-500 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <PositionIcon /> Definir Área da Estampa
                    </button>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in flex-grow overflow-y-auto pr-2"> {/* Kept overflow-y-auto for saved clothes list */}
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveCategory('Todas')} className={`px-3 py-1 text-sm rounded-full ${activeCategory === 'Todas' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Todas</button>
                        {clothingCategories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{cat}</button>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {filteredClothes.map(c => (<ClothingItemCard key={c.id} clothing={c} isSelected={selectedClothing?.id === c.id} onSelect={setSelectedClothing} onDelete={handleDeleteClothing} onRename={setEditingClothingName} onEnlarge={setEnlargedImage} onEditMask={handleOpenMaskEditorForEdit} onAddBack={handleAddBackImage} />))}
                        {filteredClothes.length === 0 && <p className="col-span-3 text-center text-gray-500 py-4">Nenhuma roupa nesta categoria. Adicione uma na aba "Nova Roupa".</p>}
                    </div>
                </div>
            )}
        </div>
    );
});

const CreatorPrintSection = memo((props: CreatorPagePrintsProps & { 
    onAddPrintClick: () => void;
    onPrintDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onPrintDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onPrintDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    isDraggingPrint: boolean;
}) => {
    const { 
        printsToShow, selectedPrintId, selectedPrintIdBack, setSelectedPrintId, 
        setSelectedPrintIdBack, handlePrintFilesChange, printUploadError, 
        handleRemovePrintBg, isRemovingBackground, selectedClothing, 
        setEnlargedImage, handleDeletePrint, onAddPrintClick, onPrintDrop, 
        onPrintDragOver, onPrintDragLeave, isDraggingPrint 
    } = props;
    const printInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 flex items-center gap-2">
                    <ImageIcon /> Estampa 
                    <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-cyan-500 dark:text-cyan-300 px-2.5 py-0.5 rounded-full">{printsToShow.length}</span>
                </h2>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2"> {/* Kept overflow-y-auto for prints list */}
                <div onDrop={onPrintDrop} onDragOver={onPrintDragOver} onDragLeave={onPrintDragLeave} className={`w-full border-2 border-dashed rounded-md p-4 text-center text-gray-500 dark:text-gray-400 transition-colors ${isDraggingPrint ? 'border-purple-400 bg-purple-500/10 dark:bg-purple-900/20' : 'border-gray-400 dark:border-gray-600 hover:border-cyan-500 hover:text-cyan-400'}`}>
                    <button onClick={onAddPrintClick} className="w-full">
                        <><UploadIcon className="h-6 w-6 mx-auto mb-1" /> Adicionar Estampa(s) ou arraste</>
                    </button>
                </div>
                <input ref={printInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handlePrintFilesChange(e.target.files)} />
                {printUploadError && <p className="text-red-400 text-sm whitespace-pre-line">{printUploadError}</p>}
                <div className="grid grid-cols-3 gap-2">
                    {printsToShow.map(p => (<PrintItemCard key={p.id} print={p} isSelectedFront={selectedPrintId === p.id} isSelectedBack={selectedPrintIdBack === p.id} onSelectFront={setSelectedPrintId} onSelectBack={setSelectedPrintIdBack} onRemoveBg={handleRemovePrintBg} isRemovingBackground={isRemovingBackground} canSelectBack={!!selectedClothing?.base64Back} onEnlarge={setEnlargedImage} onDelete={handleDeletePrint} />))}
                    {printsToShow.length === 0 && <p className="col-span-3 text-gray-500 text-center py-4">Nenhuma estampa encontrada. Adicione uma nova.</p>}
                </div>
            </div>
        </div>
    );
});

// Define the type for sidebar setting tabs
type SidebarSettingTab = 'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background'; // Removed 'generateActions'

export const CreatorPage: React.FC<CreatorPageProps> = (props) => {
    const { 
        clothingProps, printsProps, generationProps, actionsProps, uiProps,
        generationHistory, handleRestoreHistoryItem, setIsHistoryModalOpen
    } = props;

    const { selectedClothing } = clothingProps;
    const { precompositePreviewUrl, precompositePreviewUrlBack, precompositePreviewUrlBefore } = uiProps;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSettingTab, setActiveSettingTab] = useState<SidebarSettingTab | null>('generationType'); // Default to first tab
    const [isDraggingPrint, setIsDraggingPrint] = useState(false);
    const printInputRef = useRef<HTMLInputElement>(null);

    const handlePrintDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPrint(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            printsProps.handlePrintFilesChange(e.dataTransfer.files);
        }
    }, [printsProps.handlePrintFilesChange]);
    
    const handlePrintDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPrint(true);
    }, []);

    const handlePrintDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPrint(false);
    }, []);

    const handleAddPrintClick = useCallback(() => {
        printInputRef.current?.click();
    }, []);

    const renderSettingContent = () => {
        switch (activeSettingTab) {
            case 'generationType':
                return <GenerationTypeSetting {...generationProps} />;
            case 'aspectRatio':
                return <AspectRatioSetting {...generationProps} />;
            case 'generationMode':
                return <GenerationModeSetting {...generationProps} />;
            case 'color':
                return <ColorSetting {...generationProps} printsProps={printsProps} />;
            case 'blendMode':
                return <BlendModeSetting {...generationProps} />;
            case 'background':
                return <BackgroundSetting {...generationProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="relative flex flex-col h-full">
            {/* Main content area */}
            <div className={`transition-all duration-300 ease-in-out flex-grow ${isSidebarOpen ? 'xl:ml-[25rem]' : 'ml-0'} flex flex-col`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-grow">
                    {/* Column 1: Estampa */}
                    <div className="flex flex-col">
                        <CreatorPrintSection 
                            {...printsProps} 
                            onAddPrintClick={handleAddPrintClick}
                            onPrintDrop={handlePrintDrop}
                            onPrintDragOver={handlePrintDragOver}
                            onPrintDragLeave={handlePrintDragLeave}
                            isDraggingPrint={isDraggingPrint}
                        />
                    </div>

                    {/* Column 2: Inserir Roupas */}
                    <div className="flex flex-col">
                        <CreatorClothingSection {...clothingProps} />
                    </div>

                    {/* Column 3: Frente & Costas */}
                    <div className="flex flex-col gap-6">
                        {/* Frente */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex-grow flex flex-col">
                            {/* Removed h3 title */}
                            <div className="relative group aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2 flex-grow">
                                {precompositePreviewUrl ? (
                                    precompositePreviewUrlBefore ? (
                                        <ImageCompareSlider beforeSrc={precompositePreviewUrlBefore} afterSrc={precompositePreviewUrl} alt="Comparação com/sem fundo" />
                                    ) : (
                                        <ZoomableImage src={precompositePreviewUrl} alt="Pré-visualização da Frente" />
                                    )
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-2"/>
                                        <p>Pré-visualização da Frente</p>
                                    </div>
                                )}
                                <PreviewToolbar
                                    generationType={generationProps.generationType}
                                    setGenerationType={generationProps.setGenerationType}
                                    backgroundTheme={generationProps.backgroundTheme}
                                    setBackgroundTheme={generationProps.setBackgroundTheme}
                                    promptSettings={generationProps.promptSettings}
                                    customBackgroundFile={generationProps.customBackgroundFile}
                                    setCustomBackgroundFile={generationProps.setCustomBackgroundFile}
                                    handleGenerateBackground={generationProps.handleGenerateBackground}
                                    isGeneratingBackground={generationProps.isGeneratingBackground}
                                    selectedClothing={selectedClothing}
                                    handleRevertBackground={generationProps.handleRevertBackground}
                                    handleDownloadPreview={uiProps.handleDownloadPreview}
                                    precompositePreviewUrl={precompositePreviewUrl}
                                    handleSavePreviewToHistory={uiProps.handleSavePreviewToHistory}
                                    handleOpenMaskEditorForEdit={uiProps.handleOpenMaskEditorForEdit}
                                    handleAddBackImage={clothingProps.handleAddBackImage}
                                    isBackPreview={false} // Indicate this is the front preview
                                />
                                {/* Title inside the card */}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-sm font-bold px-2 py-1 rounded-md">Frente</div>
                            </div>
                        </div>

                        {/* Costas */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex-grow flex flex-col">
                            {/* Removed h3 title */}
                            <div className="relative group aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2 flex-grow">
                                {precompositePreviewUrlBack ? <ZoomableImage src={precompositePreviewUrlBack} alt="Pré-visualização das Costas" /> : (
                                    <div className="text-center text-gray-500">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-2"/>
                                        <p>Pré-visualização das Costas</p>
                                        <span className="text-xs">(Adicione uma imagem de costas à roupa)</span>
                                    </div>
                                )}
                                {selectedClothing?.base64Back && (
                                    <PreviewToolbar
                                        generationType={generationProps.generationType}
                                        setGenerationType={generationProps.setGenerationType}
                                        backgroundTheme={generationProps.backgroundTheme}
                                        setBackgroundTheme={generationProps.setBackgroundTheme}
                                        promptSettings={generationProps.promptSettings}
                                        customBackgroundFile={generationProps.customBackgroundFile}
                                        setCustomBackgroundFile={generationProps.setCustomBackgroundFile}
                                        handleGenerateBackground={generationProps.handleGenerateBackground}
                                        isGeneratingBackground={generationProps.isGeneratingBackground}
                                        selectedClothing={selectedClothing}
                                        handleRevertBackground={generationProps.handleRevertBackground}
                                        handleDownloadPreview={uiProps.handleDownloadPreview}
                                        precompositePreviewUrl={precompositePreviewUrlBack} // Use back preview URL
                                        handleSavePreviewToHistory={uiProps.handleSavePreviewToHistory}
                                        handleOpenMaskEditorForEdit={uiProps.handleOpenMaskEditorForEdit}
                                        handleAddBackImage={clothingProps.handleAddBackImage}
                                        isBackPreview={true} // Indicate this is the back preview
                                    />
                                )}
                                {/* Title inside the card */}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-sm font-bold px-2 py-1 rounded-md">Costas</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* History Timeline abaixo das 4 colunas */}
                <div className="mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                        <HistoryTimeline history={generationHistory} onRestore={handleRestoreHistoryItem} onViewAll={() => setIsHistoryModalOpen(true)} />
                    </div>
                </div>
            </div>

            {/* Painel da Barra Lateral */}
            <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-800 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full">
                    {/* Nível 1: Menu Principal */}
                    <div className="w-20 bg-gray-200 dark:bg-gray-900/50 p-2 flex flex-col items-center justify-between">
                        <div className="space-y-2 w-full">
                            <button 
                                onClick={() => setActiveSettingTab('generationType')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'generationType' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Tipo de Geração"
                            >
                                <PersonIcon className="h-5 w-5" />
                                <span className="text-xs">Tipo</span>
                            </button>
                            <button 
                                onClick={() => setActiveSettingTab('aspectRatio')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'aspectRatio' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Proporção da Imagem"
                            >
                                <AspectRatioOneOneIcon className="h-5 w-5" />
                                <span className="text-xs">Proporção</span>
                            </button>
                            <button 
                                onClick={() => setActiveSettingTab('generationMode')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'generationMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Lados para Gerar"
                            >
                                <PosesIcon className="h-5 w-5" />
                                <span className="text-xs">Lados</span>
                            </button>
                            <button 
                                onClick={() => setActiveSettingTab('color')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'color' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Cor da Roupa"
                            >
                                <PaletteIcon className="h-5 w-5" />
                                <span className="text-xs">Cor</span>
                            </button>
                            <button 
                                onClick={() => setActiveSettingTab('blendMode')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'blendMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Modo de Mesclagem"
                            >
                                <LayersIcon className="h-5 w-5" />
                                <span className="text-xs">Mesclagem</span>
                            </button>
                            <button 
                                onClick={() => setActiveSettingTab('background')} 
                                className={`w-full p-2 rounded-md text-sm flex flex-col items-center gap-1 ${activeSettingTab === 'background' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Fundo"
                            >
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-xs">Fundo</span>
                            </button>
                        </div>
                        {/* Sidebar Toggle Button - moved inside */}
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            title={isSidebarOpen ? "Esconder Painel de IA" : "Mostrar Painel de IA"}
                        >
                            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </button>
                    </div>

                    {/* Nível 2: Configurações Detalhadas */}
                    {isSidebarOpen && (
                        <div className="flex-grow w-80 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700 dark:scrollbar-track-gray-900 flex flex-col justify-between">
                            {/* Área de conteúdo para as configurações ativas */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg space-y-4 flex-grow">
                                {renderSettingContent()}
                            </div>
                            {/* Ações de Geração fixas no rodapé */}
                            <div className="mt-4">
                                <GenerateActions {...actionsProps} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
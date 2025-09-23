import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { ImageUploader } from './ImageUploader';
import { HistoryTimeline } from './HistoryTimeline';
import { ZoomableImage } from './ZoomableImage';
import { ImageCompareSlider } from './ImageCompareSlider';
import { ColorPicker } from './ColorPicker';
import { 
    SavedClothing, Print, Mask, HistoryItem, GenerationType, GenerationMode, Pose, ModelFilter, 
    PromptSettings, NewClothingFileState, ActiveNewClothingInputTab, NewClothingForm, ColorPalette
} from '../types';
import { 
    LoadingSpinner, TrashIcon, PencilIcon, MagicWandIcon, DownloadIcon, ImageIcon, HistoryIcon, 
    PersonIcon, PosesIcon, UploadIcon, ZipIcon, PositionIcon, ZoomInIcon, LayersIcon, 
    UsersIcon, PaletteIcon, NoBackgroundIcon, ClothingIcon, TagIcon, BookmarkIcon, PlusCircleIcon, 
    MinusCircleIcon, ResetIcon, RevertIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, 
    AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, ChevronLeftIcon, ChevronRightIcon
} from './Icons';
// FIX: Removed circular dependency. These types are imported from the types file.

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
}

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
    handleRemovePrintBg: (id: string) => Promise<void>;
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

interface ImageRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface ImageDimensions {
    width: number;
    height: number;
}
const blendModes = ['Normal', 'Multiply', 'Screen', 'Overlay'];

// --- Components ---

const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    generationType, setGenerationType, backgroundTheme, setBackgroundTheme,
    promptSettings, customBackgroundFile, setCustomBackgroundFile,
    handleGenerateBackground, isGeneratingBackground, selectedClothing,
    handleRevertBackground, handleDownloadPreview, precompositePreviewUrl,
    handleSavePreviewToHistory, handleOpenMaskEditorForEdit, handleAddBackImage
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
                    {isGeneratingBackground ? <LoadingSpinner/> : <MagicWandIcon className="h-4 w-4"/>} Gerar
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
                <RevertIcon />
            </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); handleDownloadPreview(precompositePreviewUrl, 'frente'); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title="Baixar Pré-visualização (Frente)">
            <DownloadIcon />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleSavePreviewToHistory('front'); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all" title="Salvar Prévia no Histórico">
            <BookmarkIcon />
        </button>
        {selectedClothing && (
            <button onClick={(e) => { e.stopPropagation(); handleOpenMaskEditorForEdit(selectedClothing, false); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-purple-600 hover:scale-110 transition-all" title="Editar Área da Estampa (Frente)">
            <PositionIcon />
            </button>
        )}
        {selectedClothing && !selectedClothing.base64Back && (
            <button onClick={(e) => { e.stopPropagation(); handleAddBackImage(selectedClothing); }} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title="Adicionar Costas">
                <PlusCircleIcon />
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

const ClothingItemCard = memo<{
    clothing: SavedClothing;
    isSelected: boolean;
    onSelect: (clothing: SavedClothing) => void;
    onDelete: (id: string) => void;
    onRename: (clothing: SavedClothing) => void;
    onEnlarge: (url: string) => void;
    onEditMask: (clothing: SavedClothing, isBack: boolean) => void;
    onAddBack: (clothing: SavedClothing) => void;
}>(({ clothing, isSelected, onSelect, onDelete, onRename, onEnlarge, onEditMask, onAddBack }) => {
    return (
        <div onClick={() => onSelect(clothing)} className={`relative group rounded-md cursor-pointer aspect-square overflow-hidden ring-2 transition-all ${isSelected ? 'ring-cyan-400' : 'ring-transparent hover:ring-cyan-500'}`}>
            <img src={`data:${clothing.mimeType};base64,${clothing.base64}`} alt={clothing.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center text-xs text-white truncate">{clothing.name}</div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(clothing.id); }}
                className="absolute top-1.5 left-1.5 bg-red-600/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all hover:scale-110"
                title="Deletar Roupa"
            >
                <TrashIcon className="h-5 w-5" />
            </button>
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onRename(clothing); }} className="bg-green-600/80 text-white p-2 rounded-full hover:bg-green-500 transition-all hover:scale-110" title="Renomear Roupa"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); onEnlarge(`data:${clothing.mimeType};base64,${clothing.base64}`); }} className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-500 transition-all hover:scale-110" title="Ampliar Imagem"><ZoomInIcon className="h-5 w-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); onEditMask(clothing, false); }} className="bg-purple-600/80 text-white p-2 rounded-full hover:bg-purple-500 transition-all hover:scale-110" title="Editar Área da Estampa (Frente)"><PositionIcon className="h-5 w-5" /></button>
                {clothing.base64Back ?
                    <button onClick={(e) => { e.stopPropagation(); onEditMask(clothing, true); }} className="bg-purple-600/80 text-white p-2 rounded-full hover:bg-purple-500 transition-all hover:scale-110" title="Editar Área da Estampa (Costas)"><PositionIcon className="h-5 w-5" /></button>
                    : <button onClick={(e) => { e.stopPropagation(); onAddBack(clothing); }} className="bg-cyan-600/80 text-white p-2 rounded-full hover:bg-cyan-500 transition-all hover:scale-110" title="Adicionar Costas"><PlusCircleIcon className="h-5 w-5" /></button>
                }
            </div>
        </div>
    );
});

const PrintItemCard = memo<{
    print: Print;
    isSelectedFront: boolean;
    isSelectedBack: boolean;
    onSelectFront: (id: string | null) => void;
    onSelectBack: (id: string | null) => void;
    onRemoveBg: (id: string) => void;
    isRemovingBackground: boolean;
    canSelectBack: boolean;
    onEnlarge: (url: string) => void;
    onDelete: (id: string) => void;
}>(({ print, isSelectedFront, isSelectedBack, onSelectFront, onSelectBack, onRemoveBg, isRemovingBackground, canSelectBack, onEnlarge, onDelete }) => {
    return (
        <div className={`relative group rounded-md cursor-pointer aspect-square overflow-hidden ring-2 transition-all ${isSelectedFront || isSelectedBack ? 'ring-cyan-400' : 'ring-transparent hover:ring-cyan-500'}`}>
            <div className="w-full h-full bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center p-1">
                <img src={`data:${print.mimeType};base64,${print.base64}`} alt={print.name} className="max-w-full max-h-full object-contain" />
            </div>
            {(isSelectedFront || isSelectedBack) && (
                <div className="absolute top-1 right-1 bg-black/60 text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-2 pointer-events-none shadow-lg">
                    {isSelectedFront && <span className="text-cyan-300 font-extrabold text-lg">F</span>}
                    {isSelectedBack && <span className="text-violet-300 font-extrabold text-lg">C</span>}
                </div>
            )}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 gap-1">
                <div className="flex flex-col gap-1 w-full">
                    <button onClick={() => onSelectFront(isSelectedFront ? null : print.id)} className={`w-full text-xs text-white py-1 rounded ${isSelectedFront ? 'bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-500'}`}>{isSelectedFront ? 'Remover Frente' : 'Add Frente'}</button>
                    <button onClick={() => onSelectBack(isSelectedBack ? null : print.id)} disabled={!canSelectBack} className={`w-full text-xs text-white py-1 rounded ${isSelectedBack ? 'bg-violet-700' : 'bg-violet-600 hover:bg-violet-500'} disabled:bg-gray-500 dark:disabled:bg-gray-600`}>{isSelectedBack ? 'Remover Costas' : 'Add Costas'}</button>
                </div>
                <button onClick={() => onRemoveBg(print.id)} disabled={isRemovingBackground || print.hasBgRemoved} className="w-full mt-1 text-xs bg-gray-600 text-white py-1 rounded hover:bg-gray-500 disabled:bg-gray-500/50 flex items-center justify-center">
                    {isRemovingBackground ? <LoadingSpinner /> : <NoBackgroundIcon className="inline h-4 w-4 mr-1" />} {print.hasBgRemoved ? 'Fundo Removido' : 'Remover Fundo'}
                </button>
                <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5">
                    <button onClick={() => onEnlarge(`data:${print.mimeType};base64,${print.base64}`)} className="bg-blue-600 text-white p-2 rounded-full transition-all hover:scale-110" title="Ampliar"><ZoomInIcon className="h-5 w-5" /></button>
                    <button onClick={() => onDelete(print.id)} className="bg-red-600 text-white p-2 rounded-full transition-all hover:scale-110" title="Deletar"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
});

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-cyan-500 dark:text-cyan-400 flex items-center gap-2"><ClothingIcon /> Inserir Roupas</h2>
            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                <button onClick={() => setActiveNewClothingTab('saved')} className={`py-2 px-4 font-semibold ${activeNewClothingTab === 'saved' ? 'text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>Salvas</button>
                <button onClick={() => setActiveNewClothingTab('new')} className={`py-2 px-4 font-semibold ${activeNewClothingTab === 'new' ? 'text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>Nova Roupa</button>
            </div>
            {activeNewClothingTab === 'new' ? (
                <div className="space-y-4 animate-fade-in">
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
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveCategory('Todas')} className={`px-3 py-1 text-sm rounded-full ${activeCategory === 'Todas' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Todas</button>
                        {clothingCategories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{cat}</button>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 flex items-center gap-2">
                    <ImageIcon /> Estampa 
                    <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-cyan-500 dark:text-cyan-300 px-2.5 py-0.5 rounded-full">{printsToShow.length}</span>
                </h2>
            </div>
            <div className="space-y-4">
                <div onDrop={onPrintDrop} onDragOver={onPrintDragOver} onDragLeave={onPrintDragLeave} className={`w-full border-2 border-dashed rounded-md p-4 text-center text-gray-500 dark:text-gray-400 transition-colors ${isDraggingPrint ? 'border-purple-400 bg-purple-500/10 dark:bg-purple-900/20' : 'border-gray-400 dark:border-gray-600 hover:border-cyan-500 hover:text-cyan-400'}`}>
                    <button onClick={onAddPrintClick} className="w-full">
                        <><UploadIcon className="h-6 w-6 mx-auto mb-1" /> Adicionar Estampa(s) ou arraste</>
                    </button>
                </div>
                <input ref={printInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handlePrintFilesChange(e.target.files)} />
                {printUploadError && <p className="text-red-400 text-sm whitespace-pre-line">{printUploadError}</p>}
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
                    {printsToShow.map(p => (<PrintItemCard key={p.id} print={p} isSelectedFront={selectedPrintId === p.id} isSelectedBack={selectedPrintIdBack === p.id} onSelectFront={setSelectedPrintId} onSelectBack={setSelectedPrintIdBack} onRemoveBg={handleRemovePrintBg} isRemovingBackground={isRemovingBackground} canSelectBack={!!selectedClothing?.base64Back} onEnlarge={setEnlargedImage} onDelete={handleDeletePrint} />))}
                    {printsToShow.length === 0 && <p className="col-span-3 text-gray-500 text-center py-4">Nenhuma estampa encontrada. Adicione uma nova.</p>}
                </div>
            </div>
        </div>
    );
});

const CreatorGenerationOptionsAndActionsSection = memo((props: { 
    generationProps: CreatorPageGenerationProps;
    actionsProps: CreatorPageActionsProps;
    printsProps: CreatorPagePrintsProps;
}) => {
    const { generationProps, actionsProps, printsProps } = props;
    const {
        generationType, setGenerationType, generationAspectRatio, setGenerationAspectRatio,
        generationMode, setGenerationMode, selectedColor, setSelectedColor, customColors,
        handleAddCustomColor, blendMode, setBlendMode, backgroundTheme, setBackgroundTheme,
        customBackgroundFile, setCustomBackgroundFile, selectedPoses, handlePoseSelection,
        modelFilter, setModelFilter, promptSettings, customBgState, handleCustomBackgroundFileChange,
        selectedClothing, handleSuggestColors, isSuggestingColors, suggestedPalettes,
    } = generationProps;
    
    const {
        isLoading, isBatchingPreviews, error, handleGenerate,
        handleGenerateAssociationsBatch, canGenerate
    } = actionsProps;

    const { selectedPrintFront } = printsProps;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg space-y-3 animated-mask-outline"> {/* Reduced padding and space-y */}
                <h2 className="text-xl font-bold text-purple-500 dark:text-purple-400 flex items-center gap-2 mb-2">
                    <MagicWandIcon className="h-6 w-6" /> Geração por IA
                </h2>
                <div>
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-0.5 block">Tipo de Geração</label> {/* Reduced mb */}
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setGenerationType('standard')} className={`p-2 text-sm rounded-md ${generationType === 'standard' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}><PersonIcon className="mx-auto mb-1 h-5 w-5" /> Padrão</button>
                        <button onClick={() => setGenerationType('poses-3')} className={`p-2 text-sm rounded-md ${generationType === 'poses-3' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}><PosesIcon className="mx-auto mb-1 h-5 w-5" /> Poses</button>
                        <button onClick={() => setGenerationType('models')} className={`p-2 text-sm rounded-md ${generationType === 'models' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}><UsersIcon className="mx-auto mb-1 h-5 w-5" /> Modelos</button>
                    </div>
                </div>
                <div>
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-0.5 block">Proporção da Imagem</label> {/* Reduced mb */}
                    <div className="grid grid-cols-5 gap-2 text-gray-800 dark:text-white">
                        <button onClick={() => setGenerationAspectRatio('1:1')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '1:1' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="1:1 (Quadrado)"><AspectRatioOneOneIcon /></button>
                        <button onClick={() => setGenerationAspectRatio('3:4')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '3:4' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="3:4 (Retrato)"><AspectRatioThreeFourIcon /></button>
                        <button onClick={() => setGenerationAspectRatio('4:3')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '4:3' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="4:3 (Paisagem)"><AspectRatioFourThreeIcon /></button>
                        <button onClick={() => setGenerationAspectRatio('9:16')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="9:16 (Retrato Widescreen)"><AspectRatioNineSixteenIcon /></button>
                        <button onClick={() => setGenerationAspectRatio('16:9')} className={`p-2 rounded-md flex justify-center items-center ${generationAspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} title="16:9 (Paisagem Widescreen)"><AspectRatioSixteenNineIcon /></button>
                    </div>
                </div>
                {generationType === 'poses-3' && (
                    <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Selecionar Poses</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(promptSettings.poses) as Pose[]).map(pose => (<button key={pose} onClick={() => handlePoseSelection(pose)} className={`p-2 rounded-md cursor-pointer text-sm w-full transition-colors ${selectedPoses.includes(pose) ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{pose}</button>))}
                        </div>
                    </div>
                )}
                {generationType === 'models' && (
                    <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Filtros de Modelo</h4>
                        <select value={modelFilter.gender} onChange={e => setModelFilter(f => ({...f, gender: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600"><option>Feminino</option><option>Masculino</option></select>
                        <select value={modelFilter.age} onChange={e => setModelFilter(f => ({...f, age: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600"><option>Infantil (5-12)</option><option>Jovem (18-25)</option><option>Adulto (26-40)</option><option>Maduro (41+)</option></select>
                        <select value={modelFilter.ethnicity} onChange={e => setModelFilter(f => ({...f, ethnicity: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600"><option>Caucasiana</option><option>Negra</option><option>Asiática</option><option>Hispânica</option><option>Indígena</option></select>
                    </div>
                )}
                {generationType === 'standard' && (
                    <div>
                        <label className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-0.5 block">Lados para Gerar</label> {/* Reduced mb */}
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setGenerationMode('front')} disabled={!selectedClothing} className={`p-2 text-sm rounded-md ${generationMode === 'front' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Frente</button>
                            <button onClick={() => setGenerationMode('back')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'back' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Costas</button>
                            <button onClick={() => setGenerationMode('both')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Ambos</button>
                        </div>
                    </div>
                )}
                <div>
                    <div className="flex justify-between items-center mb-0.5"> {/* Reduced mb */}
                        <label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><PaletteIcon /> Cor da Roupa</label>
                         <button onClick={handleSuggestColors} disabled={!selectedPrintFront || isSuggestingColors} className="text-xs flex items-center gap-1.5 bg-purple-600/50 text-white px-3 py-1.5 rounded-md hover:bg-purple-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed">
                             {isSuggestingColors ? <LoadingSpinner className="h-4 w-4" /> : <MagicWandIcon className="h-4 w-4" />}
                             Sugerir Cores com IA
                        </button>
                    </div>
                    <ColorPicker 
                        selectedColor={selectedColor} 
                        onColorChange={setSelectedColor} 
                        onAddCustomColor={handleAddCustomColor} 
                        disabled={!selectedClothing} 
                        customColors={customColors} 
                        suggestedPalettes={suggestedPalettes}
                    />
                </div>
                <div>
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-0.5 block flex items-center gap-2"><LayersIcon/> Modo de Mesclagem</label> {/* Reduced mb */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {blendModes.map(mode => (<button key={mode} onClick={() => setBlendMode(mode)} disabled={!selectedClothing} className={`p-2 text-sm rounded-md transition-colors ${blendMode === mode ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`} title={`Aplicar estampa com o modo ${mode}`}>{mode}</button>))}
                    </div>
                </div>
                <div>
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-0.5 block flex items-center gap-2"><ImageIcon /> Fundo</label> {/* Reduced mb */}
                    <select value={backgroundTheme} onChange={e => { setBackgroundTheme(e.target.value); setCustomBackgroundFile(null); }} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2 mb-2">
                        {Object.keys(promptSettings.backgrounds).map(theme => <option key={theme} value={theme}>{theme}</option>)}
                        {customBackgroundFile && <option value="Personalizado">Personalizado</option>}
                    </select>
                    <ImageUploader title="" onImageUpload={handleCustomBackgroundFileChange} previewUrl={customBackgroundFile ? URL.createObjectURL(customBackgroundFile) : null} isLoading={customBgState.isLoading} error={customBgState.error} onClear={() => { setCustomBackgroundFile(null); setBackgroundTheme(Object.keys(promptSettings.backgrounds)[0]); }} />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg sticky top-24 self-start space-y-3 animated-mask-outline">
                <h2 className="text-xl font-bold text-center mb-1 text-purple-500 dark:text-purple-400">Gerar Mockup</h2>
                <button onClick={handleGenerate} disabled={!canGenerate} className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-gray-500 dark:disabled:hover:bg-gray-600">
                    {isLoading ? <LoadingSpinner /> : <MagicWandIcon />}
                    {isLoading ? 'Gerando...' : 'Gerar'}
                </button>
                <button onClick={handleGenerateAssociationsBatch} disabled={isBatchingPreviews} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 text-sm disabled:bg-gray-500 dark:disabled:bg-gray-600">
                    {isBatchingPreviews ? <LoadingSpinner /> : <ZipIcon />} Exportar Associações
                </button>
                {error && <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded-md text-center">{error}</p>}
            </div>
        </>
    );
});


export const CreatorPage: React.FC<CreatorPageProps> = (props) => {
    const { 
        clothingProps, printsProps, generationProps, actionsProps, uiProps,
        generationHistory, handleRestoreHistoryItem, setIsHistoryModalOpen
    } = props;

    const { selectedClothing } = clothingProps;
    const { precompositePreviewUrl, precompositePreviewUrlBack, precompositePreviewUrlBefore } = uiProps;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    return (
        <div className="relative">
            {/* Main content area */}
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'xl:ml-[25rem]' : 'ml-0'}`}>
                <div className="grid grid-cols-1 xl:grid-cols-9 gap-6">
                    <div className="xl:col-span-3 space-y-6">
                        <CreatorClothingSection {...clothingProps} />
                        <CreatorPrintSection 
                            {...printsProps} 
                            onAddPrintClick={handleAddPrintClick}
                            onPrintDrop={handlePrintDrop}
                            onPrintDragOver={handlePrintDragOver}
                            onPrintDragLeave={handlePrintDragLeave}
                            isDraggingPrint={isDraggingPrint}
                        />
                    </div>

                    <div className="xl:col-span-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Frente</h3>
                                <div className="relative group aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
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
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Costas</h3>
                                <div className="relative group aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 p-2">
                                    {precompositePreviewUrlBack ? <ZoomableImage src={precompositePreviewUrlBack} alt="Pré-visualização das Costas" /> : (
                                        <div className="text-center text-gray-500">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-2"/>
                                            <p>Pré-visualização das Costas</p>
                                            <span className="text-xs">(Adicione uma imagem de costas à roupa)</span>
                                        </div>
                                    )}
                                    {selectedClothing?.base64Back && (
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onClick={() => uiProps.handleDownloadPreview(precompositePreviewUrlBack, 'costas')} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title="Baixar Pré-visualização (Costas)">
                                                <DownloadIcon />
                                            </button>
                                            <button onClick={() => uiProps.handleSavePreviewToHistory('back')} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all" title="Salvar Prévia no Histórico">
                                                <BookmarkIcon />
                                            </button>
                                            <button onClick={() => uiProps.handleOpenMaskEditorForEdit(selectedClothing, true)} className="bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-purple-600 hover:scale-110 transition-all" title="Editar Área da Estampa (Costas)">
                                                <PositionIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                         <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                            <HistoryTimeline history={generationHistory} onRestore={handleRestoreHistoryItem} onViewAll={() => setIsHistoryModalOpen(true)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Toggle Button */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`fixed top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-r-lg z-40 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-[24rem]' : 'left-0'}`}
                title={isSidebarOpen ? "Esconder Painel de IA" : "Mostrar Painel de IA"}
            >
                {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>

            {/* Sidebar Panel */}
            <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-96 bg-gray-100 dark:bg-gray-800 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700 dark:scrollbar-track-gray-900">
                    <div className="p-4 space-y-6">
                        <CreatorGenerationOptionsAndActionsSection 
                            generationProps={generationProps}
                            actionsProps={actionsProps}
                            printsProps={printsProps}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
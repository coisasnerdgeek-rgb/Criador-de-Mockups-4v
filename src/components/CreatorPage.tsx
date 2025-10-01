import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { HistoryTimeline } from '@/components/HistoryTimeline';
import { ZoomableImage } from '@/components/ZoomableImage';
import { ImageCompareSlider } from '@/components/ImageCompareSlider';

// Import new components
import { ClothingItemCard } from './ClothingItemCard';
import { PrintItemCard } from './PrintItemCard';

import { 
    SavedClothing, Print, Mask, HistoryItem, GenerationType, GenerationMode, Pose, ModelFilter, 
    PromptSettings, NewClothingFileState, ActiveNewClothingInputTab, NewClothingForm, ColorPalette,
    ImageDimensions, ImageRect,
    CreatorPageClothingProps, CreatorPagePrintsProps, CreatorPageGenerationProps, CreatorPageActionsProps, CreatorPageUIProps, CreatorPageProps
} from '../types';
import { 
    LoadingSpinner, TrashIcon, PencilIcon, MagicWandIcon, DownloadIcon, ImageIcon, HistoryIcon, 
    PersonIcon, PosesIcon, UploadIcon, ZipIcon, PositionIcon, ZoomInIcon, LayersIcon, 
    UsersIcon, PaletteIcon, NoBackgroundIcon, ClothingIcon, TagIcon, BookmarkIcon, PlusCircleIcon, 
    MinusCircleIcon, ResetIcon, RevertIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, 
    AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, ChevronLeftIcon, ChevronRightIcon, XIcon
} from './Icons';


// --- Type Definitions ---

interface PreviewToolbarProps {
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
    selectedClothing,
    handleRevertBackground, handleDownloadPreview, precompositePreviewUrl,
    handleSavePreviewToHistory, handleOpenMaskEditorForEdit, handleAddBackImage,
    isBackPreview
}) => (
    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/70 dark:bg-gray-900/70 p-2 rounded-lg shadow-lg flex flex-col gap-2" onClick={e => e.stopPropagation()}>
            {selectedClothing?.originalBase64 && (
                <button onClick={(e) => { e.stopPropagation(); handleRevertBackground(); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-yellow-600 hover:text-white transition-all" title="Reverter para Original">
                    <RevertIcon className="h-4 w-4" />
                </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleDownloadPreview(precompositePreviewUrl, isBackPreview ? 'costas' : 'frente'); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-cyan-600 hover:text-white transition-all" title={`Baixar Pré-visualização (${isBackPreview ? 'Costas' : 'Frente'})`}>
                <DownloadIcon className="h-4 w-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleSavePreviewToHistory(isBackPreview ? 'back' : 'front'); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-yellow-600 hover:text-white transition-all" title="Salvar Prévia no Histórico">
                <BookmarkIcon className="h-4 w-4" />
            </button>
            {selectedClothing && (
                <button onClick={(e) => { e.stopPropagation(); handleOpenMaskEditorForEdit(selectedClothing, isBackPreview); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-purple-600 hover:text-white transition-all" title={`Editar Área da Estampa (${isBackPreview ? 'Costas' : 'Frente'})`}>
                <PositionIcon className="h-4 w-4" />
                </button>
            )}
            {selectedClothing && !selectedClothing.base64Back && !isBackPreview && (
                <button onClick={(e) => { e.stopPropagation(); handleAddBackImage(selectedClothing); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-1 rounded-full hover:bg-cyan-600 hover:text-white transition-all" title="Adicionar Costas">
                    <PlusCircleIcon className="h-4 w-4" />
                </button>
            )}
        </div>
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
                <div className="space-y-4 animate-fade-in flex-grow overflow-y-auto pr-2">
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
                <div className="space-y-4 animate-fade-in flex-grow overflow-y-auto pr-2">
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

const CreatorPrintSection = memo((props: CreatorPagePrintsProps) => {
    const { 
        printsToShow, selectedPrintId, selectedPrintIdBack, setSelectedPrintId, 
        setSelectedPrintIdBack, handlePrintFilesChange, printUploadError, 
        handleRemovePrintBg, isRemovingBackground, selectedClothing, 
        setEnlargedImage, handleDeletePrint, onAddPrintClick, onPrintDrop, 
        onPrintDragOver, onPrintDragLeave, isDraggingPrint,
        printInputRef // Destructure printInputRef from props
    } = props;
    // Removed local printInputRef: const printInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 flex items-center gap-2">
                    <ImageIcon /> Estampa 
                    <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-cyan-500 dark:text-cyan-300 px-2.5 py-0.5 rounded-full">{printsToShow.length}</span>
                </h2>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                <div onDrop={onPrintDrop} onDragOver={onPrintDragOver} onDragLeave={onPrintDragLeave} className={`w-full border-2 border-dashed rounded-md p-4 text-center text-gray-500 dark:text-gray-400 transition-colors ${isDraggingPrint ? 'border-purple-400 bg-purple-500/10 dark:bg-purple-900/20' : 'border-gray-400 dark:border-gray-600 hover:border-cyan-500 hover:text-cyan-400'}`}>
                    <button onClick={onAddPrintClick} className="w-full">
                        <><UploadIcon className="h-6 w-6 mx-auto mb-1" /> Adicionar Estampa(s) ou arraste</>
                    </button>
                </div>
                <input ref={printInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handlePrintFilesChange(e.target.files)} />
                {printUploadError && <p className="text-red-400 text-sm whitespace-pre-line">{printUploadError}</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {printsToShow.map(p => (<PrintItemCard key={p.id} print={p} isSelectedFront={selectedPrintId === p.id} isSelectedBack={selectedPrintIdBack === p.id} onSelectFront={setSelectedPrintId} onSelectBack={setSelectedPrintIdBack} onRemoveBg={handleRemovePrintBg} isRemovingBackground={isRemovingBackground} canSelectBack={!!selectedClothing?.base64Back} onEnlarge={setEnlargedImage} onDelete={handleDeletePrint} />))}
                    {printsToShow.length === 0 && <p className="col-span-3 text-gray-500 text-center py-4">Nenhuma estampa encontrada. Adicione uma nova.</p>}
                </div>
            </div>
        </div>
    );
});

export const CreatorPage: React.FC<CreatorPageProps> = (props) => {
    const { 
        clothingProps, printsProps, generationProps, actionsProps, uiProps,
        generationHistory, handleRestoreHistoryItem, setIsHistoryModalOpen
    } = props;

    const { selectedClothing } = clothingProps;
    const { precompositePreviewUrl, precompositePreviewUrlBack, precompositePreviewUrlBefore } = uiProps;

    // Removed isSidebarOpen and activeSettingTab states
    // Removed renderSettingContent function

    return (
        <div className="relative flex flex-col h-full">
            {/* Main content area */}
            <div className={`flex-grow flex flex-col`}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow`}>
                    {/* Column 1: Estampa & Inserir Roupas */}
                    <div className="flex flex-col gap-6">
                        <CreatorPrintSection 
                            {...printsProps} 
                        />
                        <CreatorClothingSection {...clothingProps} />
                    </div>

                    {/* Column 2: Frente & Costas Previews */}
                    <div className="flex flex-col gap-6">
                        {/* Frente */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex-grow flex flex-col">
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
        </div>
    );
};
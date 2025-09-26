import React from 'react';
import { LoadingSpinner, MagicWandIcon, ZipIcon, PersonIcon, PosesIcon, UsersIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, PaletteIcon, LayersIcon, ImageIcon } from '../Icons';
import { GenerationType, GenerationMode, Pose, ModelFilter, PromptSettings, ColorPalette, Print, SavedClothing } from '../../types'; // Corrected import path
import { ColorPicker } from '../ColorPicker';
import { ImageUploader } from '../ImageUploader'; // Corrected import path

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
    activeSettingTab: 'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background'; // Removed 'generateActions'
}

export const CreatorGenerationOptionsAndActionsSection: React.FC<CreatorGenerationOptionsAndActionsSectionProps> = ({
    generationProps,
    actionsProps,
    printsProps,
    activeSettingTab,
}) => {
    const {
        generationType, setGenerationType, generationAspectRatio, setGenerationAspectRatio,
        generationMode, setGenerationMode, selectedColor, setSelectedColor, customColors,
        handleAddCustomColor, blendMode, setBlendMode, backgroundTheme, setBackgroundTheme,
        customBackgroundFile, setCustomBackgroundFile, selectedPoses, handlePoseSelection,
        modelFilter, setModelFilter, promptSettings, customBgState, handleCustomBackgroundFileChange,
        selectedClothing, handleSuggestColors, isSuggestingColors, suggestedPalettes,
    } = generationProps;
    
    const { selectedPrintFront } = printsProps;

    const renderSettingContent = () => {
        switch (activeSettingTab) {
            case 'generationType':
                return (
                    <div className="space-y-2">
                        <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block">Tipo de Geração</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setGenerationType('standard')} className={`p-2 text-sm rounded-md ${generationType === 'standard' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <PersonIcon className="mx-auto mb-1 h-5 w-5" /> Padrão
                            </button>
                            <button onClick={() => setGenerationType('poses-3')} className={`p-2 text-sm rounded-md ${generationType === 'poses-3' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <PosesIcon className="mx-auto mb-1 h-5 w-5" /> Poses
                            </button>
                            <button onClick={() => setGenerationType('models')} className={`p-2 text-sm rounded-md ${generationType === 'models' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <UsersIcon className="mx-auto mb-1 h-5 w-5" /> Modelos
                            </button>
                        </div>
                    </div>
                );
            case 'aspectRatio':
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
            case 'generationMode':
                return (
                    <div className="space-y-2">
                        {generationType === 'poses-3' && (
                            <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                                <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Selecionar Poses</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(promptSettings.poses) as Pose[]).map(pose => (
                                        <button
                                            key={pose}
                                            onClick={() => handlePoseSelection(pose)}
                                            className={`p-2 rounded-md cursor-pointer text-sm w-full transition-colors ${selectedPoses.includes(pose) ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                        >
                                            {pose}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {generationType === 'models' && (
                            <div className="space-y-2 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-md animate-fade-in">
                                <h4 className="font-semibold text-gray-500 dark:text-gray-400">Filtros de Modelo</h4>
                                <select value={modelFilter.gender} onChange={e => setModelFilter(f => ({...f, gender: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                                    <option>Feminino</option>
                                    <option>Masculino</option>
                                </select>
                                <select value={modelFilter.age} onChange={e => setModelFilter(f => ({...f, age: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                                    <option>Infantil (5-12)</option>
                                    <option>Jovem (18-25)</option>
                                    <option>Adulto (26-40)</option>
                                    <option>Maduro (41+)</option>
                                </select>
                                <select value={modelFilter.ethnicity} onChange={e => setModelFilter(f => ({...f, ethnicity: e.target.value}))} className="w-full bg-gray-200 dark:bg-gray-700 text-sm rounded p-1 border border-gray-300 dark:border-gray-600">
                                    <option>Caucasiana</option>
                                    <option>Negra</option>
                                    <option>Asiática</option>
                                    <option>Hispânica</option>
                                    <option>Indígena</option>
                                </select>
                            </div>
                        )}
                        {generationType === 'standard' && (
                            <div>
                                <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block">Lados para Gerar</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => setGenerationMode('front')} disabled={!selectedClothing} className={`p-2 text-sm rounded-md ${generationMode === 'front' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Frente</button>
                                    <button onClick={() => setGenerationMode('back')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'back' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Costas</button>
                                    <button onClick={() => setGenerationMode('both')} disabled={!selectedClothing?.base64Back} className={`p-2 text-sm rounded-md ${generationMode === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600`}>Ambos</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'color':
                return (
                    <div className="space-y-2">
                        <label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <PaletteIcon /> Cor da Roupa
                        </label>
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorChange={setSelectedColor}
                            onAddCustomColor={handleAddCustomColor}
                            disabled={!selectedClothing}
                            customColors={customColors}
                            suggestedPalettes={suggestedPalettes}
                        />
                        <button onClick={handleSuggestColors} disabled={!selectedPrintFront || isSuggestingColors} className="w-full text-sm flex items-center justify-center gap-1.5 bg-purple-600/50 text-white px-3 py-1.5 rounded-md hover:bg-purple-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isSuggestingColors ? <LoadingSpinner className="h-4 w-4" /> : <MagicWandIcon className="h-4 w-4" />}
                            Sugerir Cores com IA
                        </button>
                    </div>
                );
            case 'blendMode':
                return (
                    <div className="space-y-2">
                        <label className="text-md font-semibold text-gray-700 dark:text-gray-300 block flex items-center gap-2">
                            <LayersIcon/> Modo de Mesclagem
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {blendModes.map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setBlendMode(mode)}
                                    disabled={!selectedClothing}
                                    className={`p-2 text-sm rounded-md transition-colors ${blendMode === mode ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 dark:bg-gray-700'} disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    title={`Aplicar estampa com o modo ${mode}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'background':
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
            default:
                return null;
        }
    };

    return (
        <div className="relative flex flex-col h-full">
            {/* Main content area */}
            <div className={`transition-all duration-300 ease-in-out flex-grow ${isSidebarOpen ? 'xl:ml-64' : 'xl:ml-12'} flex flex-col`}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-grow`}> {/* Always 3 columns on xl, adjusted for sidebar width */}
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

            {/* Unified Sliding Sidebar */}
            <div className={`fixed top-16 h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-800 shadow-2xl z-30 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-0 w-64' : 'left-0 w-12'}`}>
                <div className="flex flex-col h-full">
                    {/* Icon Menu / Expanded Settings */}
                    <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700 dark:scrollbar-track-gray-900 p-2">
                        <div className="space-y-2 w-full">
                            <button 
                                onClick={() => { setActiveSettingTab('generationType'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'generationType' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Tipo de Geração"
                            >
                                <PersonIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Tipo de Geração</span>}
                            </button>
                            <button 
                                onClick={() => { setActiveSettingTab('aspectRatio'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'aspectRatio' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Proporção da Imagem"
                            >
                                <AspectRatioOneOneIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Proporção</span>}
                            </button>
                            <button 
                                onClick={() => { setActiveSettingTab('generationMode'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'generationMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Lados para Gerar"
                            >
                                <PosesIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Lados</span>}
                            </button>
                            <button 
                                onClick={() => { setActiveSettingTab('color'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'color' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Cor da Roupa"
                            >
                                <PaletteIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Cor da Roupa</span>}
                            </button>
                            <button 
                                onClick={() => { setActiveSettingTab('blendMode'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'blendMode' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Modo de Mesclagem"
                            >
                                <LayersIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Modo de Mesclagem</span>}
                            </button>
                            <button 
                                onClick={() => { setActiveSettingTab('background'); setIsSidebarOpen(true); }} 
                                className={`w-full p-2 rounded-md text-sm flex items-center gap-2 ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${activeSettingTab === 'background' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                title="Fundo"
                            >
                                <ImageIcon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="text-sm">Fundo</span>}
                            </button>
                        </div>

                        {isSidebarOpen && (
                            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg space-y-4">
                                {renderSettingContent()}
                            </div>
                        )}
                    </div>

                    {/* Ações de Geração fixas no rodapé */}
                    {isSidebarOpen && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <GenerateActions {...actionsProps} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Toggle Button (fixed and always visible) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`fixed top-1/2 -translate-y-1/2 z-40 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-12'}`}
                title={isSidebarOpen ? "Esconder Painel de IA" : "Mostrar Painel de IA"}
            >
                {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
        </div>
    );
};
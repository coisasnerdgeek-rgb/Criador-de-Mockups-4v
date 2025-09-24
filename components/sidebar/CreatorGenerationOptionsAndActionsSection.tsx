import React from 'react';
import { LoadingSpinner, MagicWandIcon, ZipIcon, PersonIcon, PosesIcon, UsersIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon, PaletteIcon, LayersIcon, ImageIcon } from '../Icons';
import { GenerationType, GenerationMode, Pose, ModelFilter, PromptSettings, ColorPalette, Print, SavedClothing } from '../../types';
import { ColorPicker } from '../ColorPicker';
import { ImageUploader } from '../ImageUploader';

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
    activeSettingTab: 'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background' | 'generateActions';
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
    
    const {
        isLoading, isBatchingPreviews, error, handleGenerate,
        handleGenerateAssociationsBatch, canGenerate
    } = actionsProps;

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
                        <div className="flex justify-between items-center">
                            <label className="text-md font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <PaletteIcon /> Cor da Roupa
                            </label>
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
            case 'generateActions':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg space-y-3 animated-mask-outline">
                        <h2 className="text-xl font-bold text-center mb-2 text-purple-500 dark:text-purple-400">Gerar Mockup</h2>
                        <button onClick={handleGenerate} disabled={!canGenerate} className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:bg-gray-500 dark:disabled:hover:bg-gray-600">
                            {isLoading ? <LoadingSpinner /> : <MagicWandIcon />}
                            {isLoading ? 'Gerando...' : 'Gerar'}
                        </button>
                        <button onClick={handleGenerateAssociationsBatch} disabled={isBatchingPreviews} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 text-sm disabled:bg-gray-500 dark:disabled:bg-gray-600">
                            {isBatchingPreviews ? <LoadingSpinner /> : <ZipIcon />} Exportar Associações
                        </button>
                        {error && <p className="text-red-400 text-sm p-2 bg-red-500/10 rounded-md text-center">{error}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    const blendModes = ['Normal', 'Multiply', 'Screen', 'Overlay']; // Define blendModes here for local use

    return (
        <div className="flex-grow w-80 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700 dark:scrollbar-track-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg space-y-4 animated-mask-outline">
                {renderSettingContent()}
            </div>
        </div>
    );
};
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import JSZip from 'jszip';

// Services and Utilities
import { generateMockup, removeBackground, generateImageWithBackground, suggestColorPalettes } from './services/geminiService';
import { apiService } from './services/apiService';
import { fileToBase64, createPrecompositeImage, pngDataUrlToJpgDataUrl, processAndValidateImageFile, downloadDataUrlAsJpg, urlToBase64, getImageDimensions, blobToFile } from './utils/fileUtils';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
    initialClothingCategories, loadingMessages, initialBackgroundPrompts, 
    initialPosePrompts, defaultMockupPrompts, defaultPromptSettings, initialImagePrompts,
    inspirationItems
} from './constants';
import { supabase } from './src/integrations/supabase/client';


// Icons
import { LogoIcon, SunIcon, MoonIcon, CreatorIcon, SparklesIcon, UsersIcon, GalleryIcon, SettingsIcon, MagicWandIcon, LightbulbIcon, ChevronLeftIcon, ChevronRightIcon, LayersIcon, XIcon } from './components/Icons';

// Page Components
import { CreatorPage } from './components/CreatorPage';
import { GalleryPage } from './components/GalleryPage';
import { AssociationsPage } from './components/AssociationsPage';
import { SettingsPage } from './components/SettingsPage';
import { ImageTreatmentPage } from './components/ImageTreatmentPage';
import { InspirationGalleryPage } from './components/InspirationGalleryPage';
import { LeftNavigation } from './src/components/LeftNavigation';

// Common UI Components
import { Lightbox } from './components/Lightbox';
import { LoadingSpinner } from './components/Icons';
import { MaskCreator } from './components/MaskCreator';
import { EditClothingNameModal } from './components/EditClothingNameModal';
import { HistoryModal } from './components/HistoryModal';
import { ResultDisplay } from './components/ResultDisplay';
import { GenerateActions } from './components/sidebar/GenerateActions';
import { CreatorGenerationOptionsAndActionsSection } from './src/components/sidebar/CreatorGenerationOptionsAndActionsSection';

// Types and Constants
import {
    SavedClothing, Print, HistoryItem, SavedMask, SavedImagePrompt, TreatmentHistoryItem, Mask,
    GenerationType, GenerationMode, Pose, ActivePage, ModelFilter, ClothingToMask, ClothingToEdit,
    NewClothingFileState, ActiveNewClothingInputTab, ImportStatus, PromptSettings, MockupPrompts,
    NewClothingForm, BatchGenerationStatus, InspirationSettings, ColorPalette, PrintCombination,
    CreatorPageProps, CreatorPagePrintsProps
} from './types';


const initialNewClothingForm: NewClothingForm = {
    file: null,
    fileBack: null,
    url: '',
    urlBack: '',
    name: '',
    category: initialClothingCategories[0],
    nameError: null,
};


// ====================================================================================
// ==================== BATCH GENERATION PROGRESS MODAL ===============================
// ====================================================================================

const BatchGenerationProgressModal: React.FC<{ status: BatchGenerationStatus; onCancel: () => void; onClose: () => void; }> = ({ status, onCancel, onClose }) => {
    const progressPercent = status.total > 0 ? (status.progress / status.total) * 100 : 0;
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 border border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                    <MagicWandIcon className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Geração de Mockups em Lote</h2>
                </div>

                {!status.isActive && (
                    <div className="text-center p-6 bg-green-500/10 dark:bg-green-900/20 rounded-lg">
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Geração Concluída!</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                            <strong>{status.completed}</strong> mockups foram gerados com sucesso e salvos na Galeria.
                        </p>
                        {status.failed > 0 && (
                             <p className="mt-1 text-red-600 dark:text-red-400">
                                <strong>{status.failed}</strong> mockups falharam. Verifique o console para mais detalhes.
                            </p>
                        )}
                        <button onClick={onClose} className="mt-4 bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500">
                            Fechar
                        </button>
                    </div>
                )}
                
                {status.isActive && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                             <p className="text-gray-700 dark:text-gray-300">
                                Gerando <strong>{status.progress + 1}</strong> de <strong>{status.total}</strong>
                            </p>
                             <div className="flex gap-4 text-sm">
                                <span className="text-green-600 dark:text-green-400">✓ {status.completed} Concluídos</span>
                                <span className="text-red-600 dark:text-red-400">✗ {status.failed} Falhas</span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                                className="bg-purple-600 h-4 rounded-full transition-all duration-500 ease-linear" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        
                        <div className="text-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Processando agora:</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={status.currentItem}>
                                {status.currentItem || "Iniciando..."}
                            </p>
                        </div>
                        
                        <div className="flex justify-center mt-6">
                            <button onClick={onCancel} className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-500">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// ====================================================================================
// ========================== MAIN APP COMPONENT ======================================
// ====================================================================================

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('creator');
  
  // --- Persisted State using useLocalStorage Hook ---
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('ai-mockup-theme', 'dark');
  const [savedClothes, setSavedClothes] = useState<SavedClothing[]>([]);
  const [generationHistory, setGenerationHistory] = useLocalStorage<HistoryItem[]>('ai-clothing-mockup-history', []);
  const [savedPrints, setSavedPrints] = useLocalStorage<Print[]>('ai-clothing-mockup-saved-prints', []);
  const [selectedPrintId, setSelectedPrintId] = useLocalStorage<string | null>('ai-clothing-mockup-selected-print-id', null);
  const [selectedPrintIdBack, setSelectedPrintIdBack] = useLocalStorage<string | null>('ai-clothing-mockup-selected-print-id-back', null);
  const [savedMasks, setSavedMasks] = useState<SavedMask[]>([]);
  const [clothingCategories, setClothingCategories] = useLocalStorage<string[]>('ai-clothing-mockup-categories', initialClothingCategories);
  const [customColors, setCustomColors] = useLocalStorage<string[]>('ai-clothing-mockup-custom-colors', []);
  const [savedImagePrompts, setSavedImagePrompts] = useState<SavedImagePrompt[]>([]);
  const [promptSettings, setPromptSettings] = useLocalStorage<PromptSettings>('ai-clothing-mockup-prompt-settings', defaultPromptSettings);


  // --- Ephemeral State (Component Lifecycle) ---
  const [selectedClothing, setSelectedClothing] = useState<SavedClothing | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [precompositePreviewUrl, setPrecompositePreviewUrl] = useState<string | null>(null);
  const [precompositePreviewUrlBack, setPrecompositePreviewUrlBack] = useState<string | null>(null);
  const [precompositePreviewUrlBefore, setPrecompositePreviewUrlBefore] = useState<string | null>(null);
  const [generationAspectRatio, setGenerationAspectRatio] = useState<string>('1:1');
  const [generationType, setGenerationType] = useState<GenerationType>('standard');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('front');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [blendMode, setBlendMode] = useState<string>('Normal');
  const [backgroundTheme, setBackgroundTheme] = useState<string>(Object.keys(initialBackgroundPrompts)[0]);
  const [customBackgroundFile, setCustomBackgroundFile] = useState<File | null>(null);
  const [selectedPoses, setSelectedPoses] = useState<Pose[]>(['Frente', 'Meio de lado']);
  
  const [modelFilter, setModelFilter] = useState<ModelFilter>({
      gender: 'Feminino',
      age: 'Jovem (18-25)',
      ethnicity: 'Caucasiana',
  });

  const [newClothingForm, setNewClothingForm] = useState<NewClothingForm>(initialNewClothingForm);
  
  const [clothingToMask, setClothingToMask] = useState<ClothingToMask | null>(null);
  const [clothingToEdit, setClothingToEdit] = useState<ClothingToEdit | null>(null);
  const [editingClothingName, setEditingClothingName] = useState<SavedClothing | null>(null);
  
  const [pendingFrontData, setPendingFrontData] = useState<{
    base: Omit<SavedClothing, 'id' | 'mask' | 'base64Back' | 'mimeTypeBack' | 'widthBack' | 'heightBack' | 'maskBack' | 'printCombinations' | 'isMinimizedInAssociations' | 'originalBase64'>;
    mask: Mask;
  } | null>(null);
  
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBatchingPreviews, setIsBatchingPreviews] = useState<boolean>(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState<boolean>(false);
  const [isZippingPreview, setIsZippingPreview] = useState<boolean>(false);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [isSuggestingColors, setIsSuggestingColors] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const loadingIntervalRef = useRef<number | null>(null);

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const [newClothingFileState, setNewClothingFileState] = useState<NewClothingFileState>({
    front: { isLoading: false, error: null, previewUrl: null },
    back: { isLoading: false, error: null, previewUrl: null },
  });
  const [customBgState, setCustomBgState] = useState<{ isLoading: boolean; error: string | null; }>({ isLoading: false, error: null });
  const [activeNewClothingTab, setActiveNewClothingTab] = useState<'saved' | 'new'>('saved');
  const [activeNewClothingInputTab, setActiveNewClothingInputTab] = useState<ActiveNewClothingInputTab>('file');

  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const addBackImageInputRef = useRef<HTMLInputElement>(null);
  const [clothingForBackImageId, setClothingForBackImageId] = useState<string | null>(null);

  const [batchGenerationStatus, setBatchGenerationStatus] = useState<BatchGenerationStatus | null>(null);
  const isBatchCancelled = useRef(false);
  const [suggestedPalettes, setSuggestedPalettes] = useState<ColorPalette[] | null>(null);

  // New state for left navigation expansion
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false);
  // New state for right sidebar (CreatorPage settings)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true); // Start open for CreatorPage
  // const [activeSettingTab, setActiveSettingTab] = useState<'generationType' | 'aspectRatio' | 'generationMode' | 'color' | 'blendMode' | 'background'>('generationType'); // REMOVED
  
  // State for print drag and drop in CreatorPage (MOVED HERE)
  const [isDraggingPrint, setIsDraggingPrint] = useState(false);
  const printInputRef = useRef<HTMLInputElement>(null);

  // State for ResultDisplay's internal zipping
  const [isZippingResultDisplay, setIsZippingResultDisplay] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Fetch data from Supabase on initial load
  useEffect(() => {
    const fetchClothes = async () => {
        const { data, error: dbError } = await supabase
            .from('clothes')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Error fetching clothes:', dbError);
            setError('Não foi possível carregar as roupas do banco de dados.');
        } else if (data) {
            const mappedData: SavedClothing[] = data.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                base64: item.base64,
                mimeType: item.mime_type,
                width: item.width,
                height: item.height,
                mask: item.mask,
                originalBase64: item.original_base64 ?? undefined, // Corrected typo here and made optional
                imageUrl: item.image_url ?? undefined,
                base64Back: item.base64_back ?? undefined,
                mimeTypeBack: item.mime_type_back ?? undefined,
                widthBack: item.width_back ?? undefined,
                heightBack: item.height_back ?? undefined,
                maskBack: item.mask_back ?? undefined,
                imageUrlBack: item.image_url_back ?? undefined,
                printCombinations: item.print_combinations || [],
                isMinimizedInAssociations: item.is_minimized_in_associations || false,
            }));
            setSavedClothes(mappedData);
            if (mappedData.length > 0) {
                setSelectedClothing(mappedData[0]);
                setActiveNewClothingTab('saved');
            } else {
                setActiveNewClothingTab('new');
            }
        }
    };

    const fetchSavedImagePrompts = async () => {
        const { data, error: dbError } = await supabase
            .from('saved_image_prompts')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Error fetching saved image prompts:', dbError);
            setError('Não foi possível carregar os prompts de imagem salvos do banco de dados.');
        } else if (data) {
            setSavedImagePrompts(data.map(item => ({
                id: item.id,
                name: item.name,
                prompt: item.prompt,
            })));
        }
    };

    const fetchSavedMasks = async () => {
        const { data, error: dbError } = await supabase
            .from('saved_masks')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Error fetching saved masks:', dbError);
            setError('Não foi possível carregar as máscaras salvas do banco de dados.');
        } else if (data) {
            setSavedMasks(data.map(item => ({
                id: item.id,
                name: item.name,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                skewX: item.skew_x,
                skewY: item.skew_y,
            })));
        }
    };

    fetchClothes();
    fetchSavedImagePrompts();
    fetchSavedMasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleAddCustomColor = (color: string) => {
    if (color && !customColors.map(c => c.toUpperCase()).includes(color.toUpperCase())) {
        setCustomColors(prev => [...prev, color].slice(-6));
    }
  };
  
  const selectedPrintFront = useMemo(() => savedPrints.find(p => p.id === selectedPrintId), [savedPrints, selectedPrintId]);
  const selectedPrintBack = useMemo(() => savedPrints.find(p => p.id === selectedPrintIdBack), [savedPrints, selectedPrintIdBack]);

  const createPreview = useCallback(async (
    clothingBase64: string | undefined,
    clothingMimeType: string | undefined,
    clothingDimensions: { width: number; height: number } | undefined,
    printDataUrl: string | null,
    maskToUse: Mask | null
  ) => {
    if (!clothingBase64 || !clothingMimeType || !clothingDimensions) {
      return null;
    }
  
    try {
      const clothingDataUrl = `data:${clothingMimeType};base64,${clothingBase64}`;
      return await createPrecompositeImage(
        clothingDataUrl,
        printDataUrl,
        maskToUse,
        clothingDimensions,
        generationAspectRatio,
        selectedColor,
        blendMode
      );
    } catch (err) {
      console.error("Failed to create precomposite preview", err);
      return `data:${clothingMimeType};base64,${clothingBase64}`;
    }
  }, [generationAspectRatio, selectedColor, blendMode]);

  useEffect(() => {
    if (!selectedClothing) {
        setPrecompositePreviewUrl(null);
        setPrecompositePreviewUrlBack(null);
        setPrecompositePreviewUrlBefore(null);
        return;
    }

    let isMounted = true;
    
    const frontPrintDataUrl = selectedPrintFront ? `data:${selectedPrintFront.mimeType};base64,${selectedPrintFront.base64}` : null;
    const backPrintDataUrl = selectedPrintBack ? `data:${selectedPrintBack.mimeType};base64,${selectedPrintBack.base64}` : null;

    const updatePreviews = async () => {
        const frontPreview = await createPreview(
            selectedClothing.base64,
            selectedClothing.mimeType,
            { width: selectedClothing.width, height: selectedClothing.height },
            selectedClothing.originalBase64 ? null : frontPrintDataUrl,
            selectedClothing.mask
        );
        if (isMounted) setPrecompositePreviewUrl(frontPreview);

        if (selectedClothing.originalBase64) {
            const frontPreviewBefore = await createPreview(
                selectedClothing.originalBase64,
                selectedClothing.mimeType,
                { width: selectedClothing.width, height: selectedClothing.height },
                frontPrintDataUrl,
                selectedClothing.mask
            );
            if (isMounted) setPrecompositePreviewUrlBefore(frontPreviewBefore);
        } else {
            if (isMounted) setPrecompositePreviewUrlBefore(null);
        }


        const backPreview = await createPreview(
            selectedClothing.base64Back,
            selectedClothing.mimeTypeBack,
            selectedClothing.widthBack && selectedClothing.heightBack
                ? { width: selectedClothing.widthBack, height: selectedClothing.heightBack }
                : undefined,
            backPrintDataUrl,
            selectedClothing.maskBack
        );
        if (isMounted) setPrecompositePreviewUrlBack(backPreview);
    };

    updatePreviews();

    return () => { isMounted = false; };
  }, [selectedClothing, selectedPrintFront, selectedPrintBack, createPreview]);


  const handleOpenMaskEditorForNew = async (isBack: boolean) => {
    const file = isBack ? newClothingForm.fileBack : newClothingForm.file;
    if (!file) return;

    if (!newClothingForm.name.trim()) {
        setNewClothingForm(prev => ({ ...prev, nameError: "O nome da roupa é obrigatório." }));
        return;
    }
    if (savedClothes.some(c => c.name.trim().toLowerCase() === newClothingForm.name.trim().toLowerCase())) {
        setNewClothingForm(prev => ({ ...prev, nameError: "Já existe uma roupa com este nome." }));
        return;
    }
    setError(null);
    setNewClothingForm(prev => ({ ...prev, nameError: null }));

    try {
        const dimensions = await getImageDimensions(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setClothingToMask({
                file: file,
                dataUrl: reader.result as string,
                ...dimensions,
                isBack,
            });
        };
        reader.onerror = () => setError("Erro ao ler o arquivo da roupa.");
    } catch (err) { setError("Não foi possível carregar as dimensões da imagem."); }
  };
  
  const resetNewClothingForm = () => {
    setNewClothingForm(initialNewClothingForm);
    setNewClothingFileState({
        front: { isLoading: false, error: null, previewUrl: null },
        back: { isLoading: false, error: null, previewUrl: null },
    });
  };

  const handleMaskSave = async (mask: Mask) => {
    // Case 1: Editing an existing mask
    if (clothingToEdit) {
        const { clothing, isBack } = clothingToEdit;
        const updatedClothing = isBack ? { ...clothing, maskBack: mask } : { ...clothing, mask: mask };
        
        const { error: updateError } = await supabase
            .from('clothes')
            .update({ [isBack ? 'mask_back' : 'mask']: mask })
            .eq('id', clothing.id);

        if (updateError) {
            setError("Falha ao atualizar a máscara no banco de dados.");
            console.error(updateError);
        } else {
            setSavedClothes(prevClothes => 
                prevClothes.map(c => c.id === clothing.id ? updatedClothing : c)
            );
            if (selectedClothing?.id === clothing.id) {
                setSelectedClothing(updatedClothing);
            }
        }
        setClothingToEdit(null);
        return;
    }

    // Case 2: Adding a back image to an existing clothing item
    if (clothingToMask && clothingForBackImageId) {
        try {
            const backBase64 = await fileToBase64(clothingToMask.file);
            const updatedClothingData = {
                base64Back: backBase64,
                mimeTypeBack: clothingToMask.file.type,
                widthBack: clothingToMask.width,
                heightBack: clothingToMask.height,
                maskBack: mask,
                imageUrlBack: newClothingForm.urlBack.trim() || undefined,
            };
            
            const { error: updateError } = await supabase
                .from('clothes')
                .update({
                    base64_back: updatedClothingData.base64Back,
                    mime_type_back: updatedClothingData.mimeTypeBack,
                    width_back: updatedClothingData.widthBack,
                    height_back: updatedClothingData.heightBack,
                    mask_back: updatedClothingData.maskBack,
                    image_url_back: updatedClothingData.imageUrlBack,
                })
                .eq('id', clothingForBackImageId);

            if (updateError) {
                setError("Falha ao salvar a imagem de costas no banco de dados.");
                console.error(updateError);
            } else {
                const originalClothing = savedClothes.find(c => c.id === clothingForBackImageId);
                if(originalClothing) {
                  const updatedClothing = { ...originalClothing, ...updatedClothingData };
                  setSavedClothes(prev => prev.map(c => c.id === clothingForBackImageId ? updatedClothing : c));
                  if (selectedClothing?.id === clothingForBackImageId) {
                      setSelectedClothing(prev => prev ? updatedClothing : null);
                  }
                }
            }
        } catch (err) {
            setError("Falha ao processar a imagem de costas.");
        } finally {
            setClothingToMask(null);
            setClothingForBackImageId(null);
        }
        return;
    }
    
    // Case 3: Saving a mask for a brand new clothing item
    if (clothingToMask) {
        try {
            let finalClothing: SavedClothing | null = null;
            if (clothingToMask.isBack) {
                // Saving BACK mask of a NEW item
                if (!pendingFrontData) {
                    setError("Erro: dados da frente não encontrados ao salvar máscara das costas.");
                    return;
                }
                const backBase64 = await fileToBase64(clothingToMask.file);
                finalClothing = {
                    ...pendingFrontData.base,
                    mask: pendingFrontData.mask,
                    id: '', // Will be set by DB
                    base64Back: backBase64,
                    mimeTypeBack: clothingToMask.file.type,
                    widthBack: clothingToMask.width,
                    heightBack: clothingToMask.height,
                    maskBack: mask,
                    imageUrlBack: newClothingForm.urlBack.trim() || undefined,
                    printCombinations: [],
                    isMinimizedInAssociations: false,
                };
            } else {
                // Saving FRONT mask of a NEW item
                const base64String = await fileToBase64(clothingToMask.file);
                const clothingBase = {
                    name: newClothingForm.name.trim(),
                    category: newClothingForm.category,
                    base64: base64String,
                    mimeType: clothingToMask.file.type,
                    width: clothingToMask.width,
                    height: clothingToMask.height,
                    imageUrl: newClothingForm.url.trim() || undefined,
                };
                if (newClothingForm.fileBack) {
                    setPendingFrontData({ base: clothingBase, mask });
                    const backFile = newClothingForm.fileBack;
                    const dimensions = await getImageDimensions(backFile);
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(backFile);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                    });
                    setClothingToMask({ file: backFile, dataUrl, ...dimensions, isBack: true });
                    return; // Wait for back mask
                } else {
                    finalClothing = { 
                        ...clothingBase, 
                        mask, 
                        id: '', // Will be set by DB
                        maskBack: null,
                        printCombinations: [],
                        isMinimizedInAssociations: false,
                    };
                }
            }

            if (finalClothing) {
                const { data: insertedData, error: insertError } = await supabase
                    .from('clothes')
                    .insert({
                        name: finalClothing.name,
                        category: finalClothing.category,
                        base64: finalClothing.base64,
                        mime_type: finalClothing.mimeType,
                        width: finalClothing.width,
                        height: finalClothing.height,
                        mask: finalClothing.mask,
                        image_url: finalClothing.imageUrl,
                        base64_back: finalClothing.base64Back,
                        mime_type_back: finalClothing.mimeTypeBack,
                        width_back: finalClothing.widthBack,
                        height_back: finalClothing.heightBack,
                        mask_back: finalClothing.maskBack,
                        image_url_back: finalClothing.imageUrlBack,
                        print_combinations: finalClothing.printCombinations,
                        is_minimized_in_associations: finalClothing.isMinimizedInAssociations,
                    })
                    .select()
                    .single();

                if (insertError) {
                    throw insertError;
                }

                const newClothingFromDb: SavedClothing = {
                    ...finalClothing,
                    id: insertedData.id,
                };

                setSavedClothes(prev => [newClothingFromDb, ...prev]);
                setSelectedClothing(newClothingFromDb);
                setActiveNewClothingTab('saved');
                resetNewClothingForm();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível salvar a roupa no banco de dados.");
            console.error(err);
        } finally {
            setClothingToMask(null);
            setPendingFrontData(null);
        }
    }
};

const handleMaskCancel = () => {
    setClothingToMask(null);
    setClothingToEdit(null);
    setPendingFrontData(null);
    setClothingForBackImageId(null);
};


  const handleOpenMaskEditorForEdit = useCallback((clothing: SavedClothing, isBack: boolean) => {
    setClothingToEdit({ clothing, isBack });
  }, []);
  
    const handleUpdateClothingName = async (clothingId: string, newName: string): Promise<string | null> => {
        const name = newName.trim();
        if (!name) {
            return "O nome não pode ficar em branco.";
        }
        if (savedClothes.some(c => c.id !== clothingId && c.name.trim().toLowerCase() === name.toLowerCase())) {
            return "Já existe uma roupa com este nome.";
        }
        
        const { error: updateError } = await supabase
            .from('clothes')
            .update({ name })
            .eq('id', clothingId);

        if (updateError) {
            console.error(updateError);
            return "Falha ao atualizar o nome no banco de dados.";
        }

        setSavedClothes(prev => prev.map(c => c.id === clothingId ? { ...c, name } : c));
        if (selectedClothing?.id === clothingId) {
            setSelectedClothing(prev => prev ? { ...prev, name } : null);
        }

        setEditingClothingName(null);
        return null;
    };
    
    const handleAddBackImage = useCallback((clothing: SavedClothing) => {
        setClothingForBackImageId(clothing.id);
        addBackImageInputRef.current?.click();
    }, []);

    const handleNewBackImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !clothingForBackImageId) {
            return;
        }
        const file = e.target.files[0];
        e.target.value = ''; // Reset input
        try {
            const dimensions = await getImageDimensions(file);
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
            setClothingToMask({ file, dataUrl, ...dimensions, isBack: true });
        } catch (err) {
            setError("Falha ao carregar a imagem de costas.");
        }
    };
    

  const handleSaveMask = async (maskToSave: Mask, name: string): Promise<boolean> => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;
    if (savedMasks.some(m => m.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
        return false;
    }

    const newSavedMask: SavedMask = {
        id: crypto.randomUUID(),
        name: trimmedName,
        ...maskToSave,
    };

    const { data, error: insertError } = await supabase.from('saved_masks').insert({
        id: newSavedMask.id,
        name: newSavedMask.name,
        x: newSavedMask.x,
        y: newSavedMask.y,
        width: newSavedMask.width,
        height: newSavedMask.height,
        rotation: newSavedMask.rotation,
        skew_x: newSavedMask.skewX,
        skew_y: newSavedMask.skewY,
    }).select().single();

    if (insertError) {
        console.error('Error inserting saved mask:', insertError);
        setError('Falha ao salvar máscara no banco de dados.');
        return false;
    }

    setSavedMasks(prev => [...prev, {
        id: data.id,
        name: data.name,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        rotation: data.rotation,
        skewX: data.skew_x,
        skewY: data.skew_y,
    }]);
    return true;
  };

  const handleDeleteSavedMask = async (idToDelete: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta máscara salva?")) {
        const { error: deleteError } = await supabase
            .from('saved_masks')
            .delete()
            .eq('id', idToDelete);

        if (deleteError) {
            console.error('Error deleting saved mask:', deleteError);
            setError('Falha ao excluir máscara do banco de dados.');
        } else {
            setSavedMasks(prev => prev.filter(m => m.id !== idToDelete));
        }
    }
  };

  const handleUpdateSavedMask = async (idToUpdate: string, newName: string): Promise<boolean> => {
    const trimmedName = newName.trim();
    if (!trimmedName) return false;
    if (savedMasks.some(m => m.id !== idToUpdate && m.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
        return false;
    }

    const { error: updateError } = await supabase
        .from('saved_masks')
        .update({ name: trimmedName })
        .eq('id', idToUpdate);

    if (updateError) {
        console.error('Error updating saved mask:', updateError);
        setError('Falha ao atualizar nome da máscara no banco de dados.');
        return false;
    }

    setSavedMasks(prev => prev.map(m => m.id === idToUpdate ? { ...m, name: trimmedName } : m));
    return true;
  };


  const handleDeleteClothing = useCallback(async (idToDelete: string) => {
    if(window.confirm("Tem certeza que deseja excluir esta peça de roupa e todas as suas associações?")) {
        const { error: deleteError } = await supabase
            .from('clothes')
            .delete()
            .eq('id', idToDelete);

        if (deleteError) {
            setError("Falha ao excluir a roupa do banco de dados.");
            console.error(deleteError);
        } else {
            setSavedClothes(prevClothes => {
                const newClothes = prevClothes.filter(c => c.id !== idToDelete);
                if (selectedClothing?.id === idToDelete) {
                    setSelectedClothing(newClothes.length > 0 ? newClothes[0] : null);
                }
                return newClothes;
            });
        }
    }
  }, [selectedClothing?.id]);
  
   const getPrecomposite = async (url: string | null) => {
      if (!url) return null;
      const base64 = url.split(',')[1];
      const mimeType = url.substring(url.indexOf(':') + 1, url.indexOf(';'));
      if (!base64 || !mimeType) throw new Error("Falha ao processar a imagem de pré-visualização.");
      return { base64, mimeType };
  };

  const generatePoseBasedMockup = useCallback(async (
        customBgData: { base64: string; mimeType: string } | null,
        backgroundThemeDescription: string
    ) => {
        if (!selectedClothing) {
            throw new Error("Para este tipo de geração, selecione uma roupa.");
        }
        
        const hasFrontPrint = !!selectedPrintFront;
        const hasBackPrint = !!selectedPrintBack;

        let generationTasks: { pose: Pose; prompt: string; precompositeUrl: string; isBack: boolean }[] = [];

        if (generationType === 'models') {
            const { gender, age, ethnicity } = modelFilter;
            const baseDesc = `Modelo ${gender}, etnia ${ethnicity}, na faixa de idade ${age}`;
            const modelPrompts: {pose: Pose, prompt: string}[] = [
                { pose: 'Frente', prompt: `${baseDesc}, em pé, corpo inteiro, olhando para a câmera.` },
                { pose: 'Meio de lado', prompt: `${baseDesc}, andando casualmente em um ambiente urbano.` },
                { pose: 'De lado', prompt: `${baseDesc}, em uma pose descontraída, sentado(a) em um banco.` }
            ];
            modelPrompts.forEach(({pose, prompt}) => {
                if(precompositePreviewUrl) {
                    generationTasks.push({ pose, prompt, precompositeUrl: precompositePreviewUrl, isBack: false })
                }
            });
        } else { // 'poses-3'
             selectedPoses.forEach(pose => {
                const isBackPose = pose === 'Costas';
                const precompositeUrl = isBackPose ? precompositePreviewUrlBack : precompositePreviewUrl;
                 if (!precompositeUrl) {
                    console.warn(`Pré-visualização para a pose "${pose}" não está disponível. Pulando.`);
                    return;
                }
                generationTasks.push({ pose, prompt: promptSettings.poses[pose], precompositeUrl, isBack: isBackPose });
             });
        }

        if (generationTasks.some(t => t.isBack && hasBackPrint && !selectedClothing.maskBack)) {
            throw new Error("Para gerar a pose de costas com estampa, defina a máscara das costas.");
        }
        
        setLoadingMessage(`Gerando ${generationTasks.length} variações...`);
        
        const generationPromises = generationTasks.map(task => {
            const hasPrint = task.isBack ? hasBackPrint : hasFrontPrint;
            return getPrecomposite(task.precompositeUrl).then(precomposite => {
                if (!precomposite) throw new Error(`Falha ao processar pré-visualização para: ${task.prompt}`);
                return generateMockup(promptSettings.mockup, precomposite.base64, precomposite.mimeType, task.prompt, selectedColor, backgroundThemeDescription, undefined, undefined, customBgData, task.isBack, hasPrint);
            });
        });

        const results = await Promise.allSettled(generationPromises);
        const finalImageUrls: string[] = [];
        const failedPoses: string[] = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                finalImageUrls.push(`data:image/png;base64,${result.value}`);
            } else {
                const poseName = generationTasks[index].pose;
                console.error(`Falha ao gerar pose "${poseName}":`, result.reason);
                failedPoses.push(poseName);
            }
        });

        if (failedPoses.length > 0) {
             setError(`Falha ao gerar ${failedPoses.length} pose(s): ${failedPoses.join(', ')}. As outras foram geradas com sucesso.`);
        }

        if (finalImageUrls.length > 0) {
            const historyName = `${selectedClothing?.name || 'Geração'} - Variações`;
            return { urls: finalImageUrls, name: historyName };
        }
        if (failedPoses.length === generationTasks.length) {
          throw new Error(`Todas as ${failedPoses.length} poses falharam. Causa comum: bloqueio de segurança.`);
        }
        return null;
  }, [generationType, modelFilter, selectedPoses, selectedClothing, selectedPrintFront, selectedPrintBack, precompositePreviewUrl, precompositePreviewUrlBack, promptSettings, selectedColor]);

  const generateStandardMockup = useCallback(async (
        customBgData: { base64: string; mimeType: string } | null,
        backgroundThemeDescription: string
    ) => {
        const hasFront = generationMode === 'front' || generationMode === 'both';
        const hasBack = generationMode === 'back' || generationMode === 'both';
        
        const hasFrontPrint = !!selectedPrintFront;
        const hasBackPrint = !!selectedPrintBack;

        if (hasFront && !selectedClothing) {
            throw new Error("Para gerar a frente, selecione uma roupa.");
        }
        if (hasFront && hasFrontPrint && !selectedClothing?.mask) {
            throw new Error("Para gerar a frente com estampa, defina a máscara da frente.");
        }
        if (hasBack && (!selectedClothing?.base64Back || (hasBackPrint && !selectedClothing.maskBack))) {
            throw new Error("Para gerar as costas com estampa, adicione uma imagem de costas à roupa e defina a máscara.");
        }

        let frontResultB64: string | undefined;
        let finalImageUrls: string[] = [];
        
        if (hasFront) {
            const precomposite = await getPrecomposite(precompositePreviewUrl);
            if (!precomposite) throw new Error("Falha ao preparar a imagem da frente.");
            frontResultB64 = await generateMockup(promptSettings.mockup, precomposite.base64, precomposite.mimeType, undefined, selectedColor, backgroundThemeDescription, undefined, undefined, customBgData, false, hasFrontPrint);
            finalImageUrls.push(`data:image/png;base64,${frontResultB64}`);
        }

        if (hasBack) {
            const precompositeBack = await getPrecomposite(precompositePreviewUrlBack);
            if (!precompositeBack) throw new Error("Falha ao preparar a imagem das costas.");
            
            const referenceImageB64 = generationMode === 'both' ? frontResultB64 : undefined;
            const referenceImageMime = generationMode === 'both' ? 'image/png' : undefined;
            const isBackViewWithoutRef = generationMode === 'back';

            const backResultB64 = await generateMockup(promptSettings.mockup, precompositeBack.base64, precompositeBack.mimeType, undefined, selectedColor, backgroundThemeDescription, referenceImageB64, referenceImageMime, customBgData, isBackViewWithoutRef, hasBackPrint);
            
            if(generationMode === 'both') {
                finalImageUrls.push(`data:image/png;base64,${backResultB64}`);
            } else {
                finalImageUrls = [`data:image/png;base64,${backResultB64}`];
            }
        }
        
        const historyName = `${selectedClothing?.name} - ${selectedPrintFront?.name || 'Sem estampa'}`;
        return { urls: finalImageUrls, name: historyName };
  }, [generationMode, selectedClothing, selectedPrintFront, selectedPrintBack, precompositePreviewUrl, precompositePreviewUrlBack, promptSettings, selectedColor]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    setGeneratedImageUrls([]);
    
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    
    loadingIntervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 2500);

    try {
        let customBgData: { base64: string; mimeType: string } | null = null;
        if (customBackgroundFile) {
            customBgData = {
                base64: await fileToBase64(customBackgroundFile),
                mimeType: customBackgroundFile.type,
            };
        }
        
        const backgroundThemeDescription = customBackgroundFile
            ? 'Use a imagem de fundo personalizada fornecida pelo usuário.'
            : promptSettings.backgrounds[backgroundTheme];

        const result = generationType === 'standard'
            ? await generateStandardMockup(customBgData, backgroundThemeDescription)
            : await generatePoseBasedMockup(customBgData, backgroundThemeDescription);

        if (result && result.urls.length > 0) {
            setGeneratedImageUrls(result.urls);
            const newHistoryItem: HistoryItem = { id: crypto.randomUUID(), date: new Date().toISOString(), images: result.urls, name: result.name };
            setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
        }

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    } finally {
        setIsLoading(false);
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    }
  }, [
      backgroundTheme, customBackgroundFile, generatePoseBasedMockup, 
      generateStandardMockup, generationType, promptSettings.backgrounds, setGenerationHistory
  ]);
  
  const handleGeneratePreviewsBatch = useCallback(async () => {
    setIsBatchingPreviews(true);
    setError(null);
    try {
        const zip = new JSZip();
        let generatedCount = 0;

        for (const clothing of savedClothes) {
            for (const combination of clothing.printCombinations) {
                // Only process combinations that have at least one print assigned to a slot
                if (combination.slots.length === 0 || !combination.slots.some(s => s.printId)) continue;
                
                // Use combination name for the folder
                const folderName = combination.name.replace(/\.[^/.]+$/, "").replace(/[\/\?<>\\:\*\|":]/g, '_');
                const subFolder = zip.folder(folderName);
                if (!subFolder) throw new Error("Could not create subfolder in zip.");
                
                let frontCount = 0;
                let backCount = 0;
                for (const slot of combination.slots) {
                    const print = savedPrints.find(p => p.id === slot.printId);
                    if (!print) continue; // Skip slots without a print

                    let sideLabel = '';
                    if (slot.type === 'front') {
                        frontCount++;
                        sideLabel = `frente_${frontCount}`;
                    } else { // 'back'
                        backCount++;
                        sideLabel = `costas_${backCount}`;
                    }

                    const clothingNameSanitized = clothing.name.replace(/[\/\?<>\\:\*\|":]/g, '_');
                    
                    const baseClothing = slot.type === 'front' ? clothing.base64 : clothing.base64Back;
                    const mimeType = slot.type === 'front' ? clothing.mimeType : clothing.mimeTypeBack;
                    const width = slot.type === 'front' ? clothing.width : clothing.widthBack;
                    const height = slot.type === 'front' ? clothing.height : clothing.heightBack;
                    const mask = slot.type === 'front' ? clothing.mask : clothing.maskBack;

                    if (!baseClothing || !mimeType || !width || !height) {
                        console.warn(`Skipping preview for ${clothing.name} (${sideLabel}) due to missing clothing data.`);
                        continue;
                    }

                    const previewUrl = await createPrecompositeImage(
                       `data:${mimeType};base64,${baseClothing}`,
                       `data:${print.mimeType};base64,${print.base64}`,
                       mask,
                       { width, height },
                       'original', null, 'Normal'
                    );

                    if (previewUrl) {
                       const jpgDataUrl = await pngDataUrlToJpgDataUrl(previewUrl);
                       const base64Data = jpgDataUrl.split(',')[1];
                       const filename = `${clothingNameSanitized}_${sideLabel}.jpg`;
                       subFolder.file(filename, base64Data, { base64: true });
                       generatedCount++;
                    }
                }
            }
        }
        
        if (generatedCount === 0) {
            throw new Error("Nenhuma combinação de estampa válida encontrada para exportar. Crie-as na aba 'Associações'.");
        }

        const zipFileName = `Associacoes_Previews_${new Date().toISOString().slice(0,10)}.zip`;
        const content = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao exportar as associações.");
    } finally {
        setIsBatchingPreviews(false);
    }
}, [savedClothes, savedPrints]);

const handleGenerateAssociationsBatch = useCallback(async () => {
    isBatchCancelled.current = false;
    const generationTasks: { clothing: SavedClothing, combination: PrintCombination, slot: PrintCombination['slots'][number] }[] = [];
    
    for (const clothing of savedClothes) {
        for (const combination of clothing.printCombinations) {
            for (const slot of combination.slots) {
                if (slot.printId) { // Only add slots that actually have a print assigned
                    generationTasks.push({ clothing, combination, slot });
                }
            }
        }
    }

    if (generationTasks.length === 0) {
        setError("Nenhuma combinação de estampa válida para gerar mockups com IA.");
        return;
    }

    setBatchGenerationStatus({
        isActive: true,
        progress: 0,
        total: generationTasks.length,
        currentItem: '',
        completed: 0,
        failed: 0,
    });

    // Cache for the first generated front image of each combination, to be used as reference for back views
    const generatedFrontImagesCache: { [combinationId: string]: string | undefined } = {};

    for (let i = 0; i < generationTasks.length; i++) {
        if (isBatchCancelled.current) {
            console.log("Geração em lote cancelada pelo usuário.");
            break;
        }

        const { clothing, combination, slot } = generationTasks[i];
        const print = savedPrints.find(p => p.id === slot.printId);
        if (!print) {
            setBatchGenerationStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
            continue;
        }

        const currentItemName = `${clothing.name} - ${combination.name} - ${slot.type === 'front' ? 'Frente' : 'Costas'} (${print.name})`;
        
        setBatchGenerationStatus(prev => prev ? { ...prev, progress: i, currentItem: currentItemName } : null);
        
        try {
            let generatedImageB64: string | undefined;
            let referenceImageB64: string | undefined;
            let referenceImageMime: string | undefined;

            const backgroundThemeDescription = customBackgroundFile 
                ? 'Use a imagem de fundo personalizada fornecida pelo usuário.' 
                : promptSettings.backgrounds[backgroundTheme];

            let customBgData: { base64: string; mimeType: string } | null = null;
            if (customBackgroundFile) {
                customBgData = { base64: await fileToBase64(customBackgroundFile), mimeType: customBackgroundFile.type };
            }

            const tempCreatePreview = async (isBack: boolean) => {
                 const clothingBase64 = isBack ? clothing.base64Back : clothing.base64;
                 const clothingMimeType = isBack ? clothing.mimeTypeBack : clothing.mimeType;
                 const clothingDimensions = isBack ? {width: clothing.widthBack!, height: clothing.heightBack!} : {width: clothing.width, height: clothing.height};
                 const maskToUse = isBack ? clothing.maskBack : clothing.mask;
                 const printDataUrl = `data:${print.mimeType};base64,${print.base64}`;

                 return createPrecompositeImage(`data:${clothingMimeType};base64,${clothingBase64}`, printDataUrl, maskToUse, clothingDimensions, generationAspectRatio, selectedColor, blendMode);
            }

            if (slot.type === 'front') {
                if (!clothing.mask) {
                    throw new Error("Máscara da frente não definida para a roupa.");
                }
                const precompositeUrl = await tempCreatePreview(false);
                const precomposite = await getPrecomposite(precompositeUrl);
                if (!precomposite) throw new Error("Falha ao criar pré-composição da frente.");

                generatedImageB64 = await generateMockup(promptSettings.mockup, precomposite.base64, precomposite.mimeType, undefined, selectedColor, backgroundThemeDescription, undefined, undefined, customBgData, false, true);
                
                // Cache the first generated front image for this combination
                if (!generatedFrontImagesCache[combination.id]) {
                    generatedFrontImagesCache[combination.id] = generatedImageB64;
                }
            } else { // slot.type === 'back'
                if (!clothing.base64Back || !clothing.maskBack) {
                    throw new Error("Imagem de costas ou máscara de costas não definida para a roupa.");
                }
                const precompositeUrlBack = await tempCreatePreview(true);
                const precompositeBack = await getPrecomposite(precompositeUrlBack);
                if (!precompositeBack) throw new Error("Falha ao criar pré-composição das costas.");
                
                // Use the cached front image as reference if available for this combination
                referenceImageB64 = generatedFrontImagesCache[combination.id];
                referenceImageMime = referenceImageB64 ? 'image/png' : undefined;

                generatedImageB64 = await generateMockup(promptSettings.mockup, precompositeBack.base64, precompositeBack.mimeType, undefined, selectedColor, backgroundThemeDescription, referenceImageB64, referenceImageMime, customBgData, !referenceImageB64, true);
            }

            if (generatedImageB64) {
                const newHistoryItem: HistoryItem = { 
                    id: crypto.randomUUID(), 
                    date: new Date().toISOString(), 
                    images: [`data:image/png;base64,${generatedImageB64}`], 
                    name: currentItemName 
                };
                setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
                setBatchGenerationStatus(prev => prev ? { ...prev, completed: prev.completed + 1 } : null);
            } else {
                 setBatchGenerationStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
            }

        } catch (err) {
            console.error(`Falha ao gerar mockup para ${currentItemName}:`, err);
            setBatchGenerationStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
        }
    }
    
    setBatchGenerationStatus(prev => prev ? { ...prev, isActive: false, progress: prev.total } : null);
}, [savedClothes, savedPrints, customBackgroundFile, promptSettings.backgrounds, backgroundTheme, generationAspectRatio, selectedColor, blendMode, setGenerationHistory, promptSettings.mockup]);


const handleCancelBatchGeneration = () => {
    isBatchCancelled.current = true;
};

  const handleDownloadPreview = (url: string | null, side: 'frente' | 'costas') => {
    if (!url || !selectedClothing) return;
    const filename = `${selectedClothing.name}-previa-${side}`;
    downloadDataUrlAsJpg(url, filename);
  };
  
    const handleSavePreviewToHistory = (side: 'front' | 'back') => {
        const url = side === 'front' ? precompositePreviewUrl : precompositePreviewUrlBack;
        if (!url || !selectedClothing) return;

        const printName = side === 'front' ? selectedPrintFront?.name : selectedPrintBack?.name;
        
        const historyName = `Prévia: ${selectedClothing.name}${printName ? ` - ${printName.replace(/\.[^/.]+$/, "")}`: ''}`;
        
        const newHistoryItem: HistoryItem = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            images: [url],
            name: historyName,
        };
        setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    };

  const handleDownloadPreviewsAsZip = async () => {
      if (!precompositePreviewUrl || !precompositePreviewUrlBack || !selectedClothing) return;
      
      setIsZippingPreview(true);
      setError(null);
      try {
          const zip = new JSZip();
          const zipFilename = `${selectedClothing.name}-previa.zip`;
          
          const frontJpg = await pngDataUrlToJpgDataUrl(precompositePreviewUrl);
          zip.file(`${selectedClothing.name}-previa-frente.jpg`, frontJpg.split(',')[1], { base64: true });

          const backJpg = await pngDataUrlToJpgDataUrl(precompositePreviewUrlBack);
          zip.file(`${selectedClothing.name}-previa-costas.jpg`, backJpg.split(',')[1], { base64: true });
          
          const content = await zip.generateAsync({ type: 'blob' });
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = zipFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);

      } catch (error) {
          console.error("Failed to create ZIP file for previews", error);
          setError("Falha ao criar o arquivo ZIP das pré-visualizações.");
      } finally {
          setIsZippingPreview(false);
      }
  };

  const handleNewClothingFileChange = async (file: File, isBack: boolean) => {
    const stateKey = isBack ? 'back' : 'front';
    const previewUrl = URL.createObjectURL(file);
    setNewClothingFileState(prev => ({ ...prev, [stateKey]: { isLoading: true, error: null, previewUrl } }));
    try {
      const validatedFile = await processAndValidateImageFile(file);
      setNewClothingForm(prev => ({ ...prev, [isBack ? 'fileBack' : 'file']: validatedFile }));
    } catch (err) {
       setNewClothingFileState(prev => ({ ...prev, [stateKey]: { isLoading: false, error: err instanceof Error ? err.message : 'Erro desconhecido', previewUrl: null } }));
       setNewClothingForm(prev => ({ ...prev, [isBack ? 'fileBack' : 'file']: null }));
    } finally {
       setNewClothingFileState(prev => ({ ...prev, [stateKey]: { ...prev[stateKey], isLoading: false } }));
    }
  };

  const handleClearNewClothingFile = (isBack: boolean) => {
    if (isBack) {
        setNewClothingForm(prev => ({ ...prev, fileBack: null, urlBack: '' }));
        setNewClothingFileState(prev => ({ ...prev, back: { isLoading: false, error: null, previewUrl: null } }));
    } else {
        setNewClothingForm(prev => ({ ...prev, file: null, url: '' }));
        setNewClothingFileState(prev => ({ ...prev, front: { isLoading: false, error: null, previewUrl: null } }));
    }
  };

  const handleLoadFromUrl = async (url: string, isBack: boolean) => {
    const stateKey = isBack ? 'back' : 'front';
    if (!url.trim()) return;

    setNewClothingFileState(prev => ({ ...prev, [stateKey]: { isLoading: true, error: null, previewUrl: null } }));
    try {
        const dataUrl = await urlToBase64(url);
        const { blob, mimeType } = await (await fetch(dataUrl)).blob().then(b => ({ blob: b, mimeType: b.type }));
        const fileName = url.substring(url.lastIndexOf('/') + 1) || 'image.png';
        const file = blobToFile(blob, fileName);
        
        const validatedFile = await processAndValidateImageFile(file);
        setNewClothingForm(prev => ({ ...prev, [isBack ? 'fileBack' : 'file']: validatedFile }));
        setNewClothingFileState(prev => ({ ...prev, [stateKey]: { isLoading: false, error: null, previewUrl: URL.createObjectURL(validatedFile) }}));

    } catch (error) {
        console.error("Failed to load from URL:", error);
        const errorMessage = error instanceof Error ? error.message : "Não foi possível carregar a imagem. Verifique a URL e as permissões de CORS.";
        setNewClothingFileState(prev => ({ ...prev, [stateKey]: { isLoading: false, error: errorMessage, previewUrl: null } }));
        setNewClothingForm(prev => ({ ...prev, [isBack ? 'fileBack' : 'file']: null }));
    }
  };
  
  const handleCustomBackgroundFileChange = async (file: File) => {
    setCustomBgState({ isLoading: true, error: null });
    try {
      const validatedFile = await processAndValidateImageFile(file);
      setCustomBackgroundFile(validatedFile);
      setBackgroundTheme('Personalizado');
    } catch (err) {
      setCustomBgState({ isLoading: false, error: err instanceof Error ? err.message : 'Erro desconhecido' });
      setCustomBackgroundFile(null);
    } finally {
      setCustomBgState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const handlePrintFilesChange = useCallback(async (files: FileList) => {
    const newPrints: Print[] = [];
    const uploadErrors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const validatedFile = await processAndValidateImageFile(file);
        const base64 = await fileToBase64(validatedFile);
        const newPrint: Print = {
          id: crypto.randomUUID(),
          name: validatedFile.name,
          base64,
          mimeType: validatedFile.type,
          hasBgRemoved: false,
        };
        newPrints.push(newPrint);
      } catch (err) {
        uploadErrors.push(`${file.name}: ${err instanceof Error ? err.message : "Falha ao carregar."}`);
      }
    }

    if (newPrints.length > 0) {
      setSavedPrints(prev => [...prev, ...newPrints]);
    }
    if (uploadErrors.length > 0) {
      console.error("Print upload errors:", uploadErrors.join('\n'));
    }
  }, [setSavedPrints]);
  
  const handleDeletePrint = useCallback((idToDelete: string) => {
      setSavedPrints(prev => prev.filter(p => p.id !== idToDelete));
      setSavedClothes(prevClothes => prevClothes.map(c => ({
        ...c,
        printCombinations: c.printCombinations.map(combo => ({
            ...combo,
            slots: combo.slots.map(slot => ({
                ...slot,
                printId: slot.printId === idToDelete ? null : slot.printId
            }))
        }))
      })));
      if (selectedPrintId === idToDelete) setSelectedPrintId(null);
      if (selectedPrintIdBack === idToDelete) setSelectedPrintIdBack(null);
  }, [selectedPrintId, selectedPrintIdBack, setSavedPrints, setSelectedPrintId, setSelectedPrintIdBack]);

  const handleRemovePrintBg = useCallback(async (printId: string) => {
      const print = savedPrints.find(p => p.id === printId);
      if (!print) return;

      setIsRemovingBackground(true);
      setError(null);
      try {
          const removedBgBase64 = await removeBackground(print.base64, print.mimeType);
          const updatedPrint: Print = { ...print, base64: removedBgBase64, mimeType: 'image/png', hasBgRemoved: true };
          setSavedPrints(prev => prev.map(p => p.id === printId ? updatedPrint : p));
      } catch (err) {
          setError(err instanceof Error ? err.message : "Falha ao remover o fundo.");
      } finally {
          setIsRemovingBackground(false);
      }
  }, [savedPrints, setSavedPrints]);
    
    const handlePoseSelection = (pose: Pose) => {
        setSelectedPoses(prev => 
            prev.includes(pose) ? prev.filter(p => p !== pose) : [...prev, pose]
        );
    };
    
    const handleDeleteHistoryItem = useCallback((idToDelete: string) => {
        setGenerationHistory(prev => prev.filter(item => item.id !== idToDelete));
    }, [setGenerationHistory]);
    
    const handleDeleteAllHistory = useCallback(() => {
        if (window.confirm("Tem certeza que deseja limpar permanentemente toda a galeria? Esta ação não pode ser desfeita.")) {
            setGenerationHistory([]);
        }
    }, [setGenerationHistory]);

    const handleRestoreHistoryItem = useCallback((item: HistoryItem) => {
        if (item.name.startsWith("Prévia:")) {
            setEnlargedImage(item.images[0]);
        } else {
            setGeneratedImageUrls(item.images);
            setActivePage('creator');
        }
         setIsHistoryModalOpen(false);
    }, [setGeneratedImageUrls, setEnlargedImage]);

    const handleGenerateBackground = async () => {
        if (!selectedClothing || !precompositePreviewUrl) return;
        setIsGeneratingBackground(true);
        setError(null);
        try {
            const precomposite = await getPrecomposite(precompositePreviewUrl);
            if (!precomposite) throw new Error("Could not get precomposite image");
            
            const generatedBgBase64 = await generateImageWithBackground(precomposite.base64, precomposite.mimeType, promptSettings.backgrounds[backgroundTheme]);
            
            const updateData = {
                base64: generatedBgBase64,
                mime_type: 'image/png',
                original_base64: selectedClothing.originalBase64 ?? selectedClothing.base64,
            };

            const { error: updateError } = await supabase.from('clothes').update(updateData).eq('id', selectedClothing.id);

            if (updateError) throw updateError;

            const updateClothingWithBg = (c: SavedClothing) => ({
                ...c,
                base64: generatedBgBase64,
                mimeType: 'image/png',
                originalBase64: c.originalBase64 ?? c.base64,
            });
            
            setSavedClothes(prev => prev.map(c => c.id === selectedClothing.id ? updateClothingWithBg(c) : c));
            setSelectedClothing(prev => prev ? updateClothingWithBg(prev) : null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate background");
            console.error(err);
        } finally {
            setIsGeneratingBackground(false);
        }
    };

    const handleRevertBackground = async () => {
        if (!selectedClothing || !selectedClothing.originalBase64) return;
        
        const originalBase64 = selectedClothing.originalBase64;
        
        const updateData = {
            base64: originalBase64,
            original_base64: null,
        };

        const { error: updateError } = await supabase.from('clothes').update(updateData).eq('id', selectedClothing.id);
        if (updateError) {
            setError("Failed to revert background in database.");
            console.error(updateError);
            return;
        }

        const revertClothing = (c: SavedClothing) => {
            const { originalBase64: _, ...rest } = c;
            return { ...rest, base64: originalBase64! };
        };

        setSavedClothes(prev => prev.map(c => c.id === selectedClothing.id ? revertClothing(c) : c));
        setSelectedClothing(prev => prev ? revertClothing(prev) : null);
    };

    const handleExportData = async () => {
        try {
            const zip = new JSZip();
            const imagesFolder = zip.folder("images");
            if (!imagesFolder) throw new Error("Could not create images folder in zip.");
    
            const cleanSavedClothes = [];
            for (const clothing of savedClothes) {
                const { base64, base64Back, originalBase64, ...rest } = clothing;
                const cleanClothing: any = { ...rest };
    
                if (base64) {
                    const fileName = `clothing_${clothing.id}_front.png`;
                    imagesFolder.file(fileName, base64, { base64: true });
                    cleanClothing.imagePath = `images/${fileName}`;
                }
                if (base64Back) {
                    const fileName = `clothing_${clothing.id}_back.png`;
                    imagesFolder.file(fileName, base64Back, { base64: true });
                    cleanClothing.imagePathBack = `images/${fileName}`;
                }
                if (originalBase64) {
                    const fileName = `clothing_${clothing.id}_original.png`;
                    imagesFolder.file(fileName, originalBase64, { base64: true });
                    cleanClothing.imagePathOriginal = `images/${fileName}`;
                }
                cleanSavedClothes.push(cleanClothing);
            }
    
            const cleanSavedPrints = [];
            for (const print of savedPrints) {
                const { base64, ...rest } = print;
                const fileName = `print_${print.id}.${print.mimeType.split('/')[1] || 'png'}`;
                imagesFolder.file(fileName, base64, { base64: true });
                cleanSavedPrints.push({ ...rest, imagePath: `images/${fileName}` });
            }

            // Fetch treatment prints from Supabase
            const { data: treatmentPrintsData, error: tpError } = await supabase.from('treatment_prints').select('*');
            if (tpError) throw tpError;
            const cleanTreatmentPrints = [];
            for (const print of treatmentPrintsData) {
                const fileName = `treatment_print_${print.id}.${print.mime_type.split('/')[1] || 'png'}`;
                imagesFolder.file(fileName, print.base64, { base64: true });
                cleanTreatmentPrints.push({ ...print, imagePath: `images/${fileName}` });
            }

            // Fetch treatment history from Supabase
            const { data: treatmentHistoryData, error: thError } = await supabase.from('treatment_history').select('*');
            if (thError) throw thError;
            const cleanTreatmentHistory = treatmentHistoryData.map(item => ({
                ...item,
                generatedImage: { base64: item.generated_image_base64, mimeType: item.generated_image_mime_type },
                additionalImages: item.additional_images,
            }));

            // Fetch saved image prompts from Supabase
            const { data: savedImagePromptsData, error: sipError } = await supabase.from('saved_image_prompts').select('*');
            if (sipError) throw sipError;
            const cleanSavedImagePrompts = savedImagePromptsData.map(item => ({
                id: item.id,
                name: item.name,
                prompt: item.prompt,
            }));

            // Fetch saved masks from Supabase
            const { data: savedMasksData, error: smError } = await supabase.from('saved_masks').select('*');
            if (smError) throw smError;
            const cleanSavedMasks = savedMasksData.map(item => ({
                id: item.id,
                name: item.name,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                skewX: item.skew_x,
                skewY: item.skew_y,
            }));
    
            const backupData = {
                savedClothes: cleanSavedClothes,
                savedPrints: cleanSavedPrints,
                treatmentPrints: cleanTreatmentPrints,
                treatmentHistory: cleanTreatmentHistory,
                generationHistory,
                clothingCategories,
                promptSettings,
                customColors,
                savedMasks: cleanSavedMasks,
                savedImagePrompts: cleanSavedImagePrompts,
                dataType: 'mockup-creator-backup',
                version: '2.4-colocated'
            };
    
            zip.file("data.json", JSON.stringify(backupData, null, 2));
    
            const content = await zip.generateAsync({ type: 'blob' });
            const date = new Date().toISOString().slice(0, 10);
            const link = document.createElement('a');
            link.download = `mockup_creator_backup_${date}.zip`;
            link.href = URL.createObjectURL(content);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
    
        } catch (err) {
            console.error("Failed to export data as ZIP", err);
            setImportStatus({ message: `Ocorreu um erro ao exportar os dados: ${err instanceof Error ? err.message : 'Erro desconhecido.'}`, error: true });
        }
    };
    
    const handleImportData = async (file: File) => {
        if (!file) return;

        setImportStatus({ message: "Processando arquivo de backup...", error: false, progress: 0 });
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // UI delay for feedback
            const zip = await JSZip.loadAsync(file);
            
            const dataJsonPath = Object.keys(zip.files).find(path => path.endsWith('data.json'));
            if (!dataJsonPath) {
                throw new Error("Arquivo 'data.json' não encontrado no backup. Formato inválido.");
            }
            
            const dataFile = zip.files[dataJsonPath];
            const basePath = dataJsonPath.substring(0, dataJsonPath.lastIndexOf('/') + 1);
            
            setImportStatus({ message: "Verificando conteúdo...", error: false, progress: 10 });
            const dataContent = await dataFile.async("string");
            const data = JSON.parse(dataContent);
            
            if (data.dataType !== 'mockup-creator-backup') {
                throw new Error("Este não parece ser um arquivo de backup válido.");
            }

            if (!window.confirm("AVISO: A importação de um backup substituirá TODOS os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?")) {
                setImportStatus(null);
                return;
            }
            
            setImportStatus({ message: "Restaurando dados...", error: false, progress: 20 });
            
            const clothesData = data.savedClothes || [];
            const printsData = data.savedPrints || [];
            const treatmentPrintsData = data.treatmentPrints || [];
            const treatmentHistoryData = data.treatmentHistory || [];
            const savedImagePromptsData = data.savedImagePrompts || [];
            const savedMasksData = data.savedMasks || [];

            const totalImages = (clothesData.length * 3) + printsData.length + treatmentPrintsData.length;
            let processedImages = 0;
            const initialProgress = 20;
            const progressRange = 75;

            const readImageFromZip = async (path: string | undefined): Promise<string | undefined> => {
                if (!path) return undefined;
                const fullPath = basePath + path;
                const imgFile = zip.files[fullPath];
                if (imgFile) {
                    const base64 = await imgFile.async("base64");
                    processedImages++;
                    if (totalImages > 0) {
                         setImportStatus(prev => ({ 
                            ...(prev ?? { message: '', error: false }),
                            message: "Restaurando imagens...",
                            progress: Math.round(initialProgress + (processedImages / totalImages) * progressRange),
                        }));
                    }
                    return base64;
                }
                throw new Error(`Imagem '${fullPath}' referenciada no backup mas não encontrada no arquivo .zip.`);
            };
    
            const rehydratedClothes = await Promise.all(clothesData.map(async (clothing: any) => {
                const { imagePath, imagePathBack, imagePathOriginal, ...rest } = clothing;
                return {
                    ...rest,
                    base64: await readImageFromZip(imagePath),
                    base64Back: await readImageFromZip(imagePathBack),
                    originalBase64: await readImageFromZip(imagePathOriginal),
                };
            }));
    
            const rehydratedPrints = await Promise.all(printsData.map(async (print: any) => {
                const { imagePath, ...rest } = print;
                return { ...rest, base64: await readImageFromZip(imagePath) };
            }));

            const rehydratedTreatmentPrints = await Promise.all(treatmentPrintsData.map(async (print: any) => {
                const { imagePath, ...rest } = print;
                return { ...rest, base64: await readImageFromZip(imagePath) };
            }));

            const rehydratedTreatmentHistory = treatmentHistoryData.map((item: any) => ({
                ...item,
                generatedImage: { base64: item.generated_image_base64, mimeType: item.generated_image_mime_type },
                additionalImages: item.additional_images,
            }));

            const rehydratedSavedImagePrompts = savedImagePromptsData.map((item: any) => ({
                id: item.id,
                name: item.name,
                prompt: item.prompt,
            }));

            const rehydratedSavedMasks = savedMasksData.map((item: any) => ({
                id: item.id,
                name: item.name,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                skewX: item.skew_x,
                skewY: item.skew_y,
            }));

            const keysToClear = [
                'ai-clothing-mockup-saved-clothes', 'ai-clothing-mockup-history', 'ai-clothing-mockup-saved-prints',
                'ai-mockup-treatment-prints', 'ai-clothing-mockup-selected-print-id', 'ai-clothing-mockup-selected-print-id-back',
                'ai-clothing-mockup-saved-masks', 'ai-clothing-mockup-categories', 'ai-clothing-mockup-custom-colors',
                'ai-clothing-mockup-image-prompts', 'ai-clothing-mockup-treatment-history', 'ai-clothing-mockup-prompt-settings'
            ];
            keysToClear.forEach(key => localStorage.removeItem(key));
            
            // Clear existing data in DB before importing
            await supabase.from('clothes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('treatment_prints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('treatment_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('saved_image_prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('saved_masks').delete().neq('id', '00000000-0000-0000-0000-000000000000');


            const dbClothesRecords = rehydratedClothes.map((c: any) => ({
                id: c.id,
                name: c.name,
                category: c.category,
                base64: c.base64,
                mime_type: c.mimeType,
                width: c.width,
                height: c.height,
                mask: c.mask,
                original_base64: c.originalBase64,
                image_url: c.imageUrl,
                base64_back: c.base64Back,
                mime_type_back: c.mimeTypeBack,
                width_back: c.widthBack,
                height_back: c.heightBack,
                mask_back: c.maskBack,
                image_url_back: c.imageUrlBack,
                print_combinations: c.printCombinations,
                is_minimized_in_associations: c.isMinimizedInAssociations,
            }));
            await supabase.from('clothes').insert(dbClothesRecords);

            const dbTreatmentPrintsRecords = rehydratedTreatmentPrints.map((p: any) => ({
                id: p.id,
                name: p.name,
                base64: p.base64,
                mime_type: p.mimeType,
                has_bg_removed: p.hasBgRemoved,
            }));
            await supabase.from('treatment_prints').insert(dbTreatmentPrintsRecords);

            const dbTreatmentHistoryRecords = rehydratedTreatmentHistory.map((item: any) => ({
                id: item.id,
                date: item.date,
                original_print_id: item.originalPrintId,
                generated_image_base64: item.generatedImage.base64,
                generated_image_mime_type: item.generatedImage.mimeType,
                prompt: item.prompt,
                additional_images: item.additionalImages,
            }));
            await supabase.from('treatment_history').insert(dbTreatmentHistoryRecords);

            const dbSavedImagePromptsRecords = rehydratedSavedImagePrompts.map((p: any) => ({
                id: p.id,
                name: p.name,
                prompt: p.prompt,
            }));
            await supabase.from('saved_image_prompts').insert(dbSavedImagePromptsRecords);

            const dbSavedMasksRecords = rehydratedSavedMasks.map((m: any) => ({
                id: m.id,
                name: m.name,
                x: m.x,
                y: m.y,
                width: m.width,
                height: m.height,
                rotation: m.rotation,
                skewX: m.skew_x,
                skewY: m.skew_y,
            }));
            await supabase.from('saved_masks').insert(dbSavedMasksRecords);
            
            localStorage.setItem('ai-clothing-mockup-saved-prints', JSON.stringify(rehydratedPrints));
            localStorage.setItem('ai-clothing-mockup-history', JSON.stringify(data.generationHistory || []));
            localStorage.setItem('ai-clothing-mockup-categories', JSON.stringify(data.clothingCategories || initialClothingCategories));
            localStorage.setItem('ai-clothing-mockup-prompt-settings', JSON.stringify(data.promptSettings || defaultPromptSettings));
            localStorage.setItem('ai-clothing-mockup-custom-colors', JSON.stringify(data.customColors || []));
            
            setImportStatus({ message: "Importação concluída com sucesso! Recarregando...", error: false, progress: 100 });
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.reload();

        } catch (err) {
            console.error("Failed to import data from ZIP", err);
            setImportStatus({ message: `Ocorreu um erro ao importar: ${err instanceof Error ? err.message : 'Erro desconhecido.'}`, error: true });
        }
    };

    const handleApplyInspirationStyle = (settings: InspirationSettings) => {
        setGenerationType(settings.generationType);
        setGenerationAspectRatio(settings.generationAspectRatio);
        setGenerationMode(settings.generationMode);
        setSelectedColor(settings.selectedColor);
        setBlendMode(settings.blendMode);
        setBackgroundTheme(settings.backgroundTheme);
        setSelectedPoses(settings.selectedPoses);
        setModelFilter(settings.modelFilter);
        setActivePage('creator');
    };
    
    const handleSuggestColors = async () => {
        if (!selectedPrintFront) {
            setError("Para sugerir cores, selecione uma estampa para a frente.");
            return;
        }
        setIsSuggestingColors(true);
        setSuggestedPalettes(null);
        setError(null);
        try {
            const palettes = await suggestColorPalettes(selectedPrintFront.base64);
            setSuggestedPalettes(palettes);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao sugerir cores.";
            setError(message);
            console.error(err);
        } finally {
            setIsSuggestingColors(false);
        }
    };

    const handleUpdateClothing = async (clothingId: string, updates: Partial<SavedClothing>) => {
        const dbUpdates: any = {};
        if (updates.printCombinations) dbUpdates.print_combinations = updates.printCombinations;
        if (updates.isMinimizedInAssociations !== undefined) dbUpdates.is_minimized_in_associations = updates.isMinimizedInAssociations;

        const { error: updateError } = await supabase.from('clothes').update(dbUpdates).eq('id', clothingId);

        if (updateError) {
            setError("Falha ao salvar as alterações da associação.");
            console.error(updateError);
            return;
        }

        setSavedClothes(prev => prev.map(c => c.id === clothingId ? { ...c, ...updates } : c));
    };

    // --- Print Drag & Drop Handlers (moved from CreatorPage) ---
    const handlePrintDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPrint(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handlePrintFilesChange(e.dataTransfer.files);
        }
    }, [handlePrintFilesChange]);
    
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


    // --- Filtered Data ---
    const filteredClothes = useMemo(() => {
        return activeCategory === 'Todas' ? savedClothes : savedClothes.filter(c => c.category === activeCategory);
    }, [savedClothes, activeCategory]);

    const printsToShow = useMemo(() => {
        return [...savedPrints].sort((a, b) => a.name.localeCompare(b.name));
    }, [savedPrints]);

    const canGenerate = useMemo(() => {
        return !isLoading && !!selectedClothing;
    }, [isLoading, selectedClothing]);

    // --- Props for Sub-pages ---
    const creatorPageProps: CreatorPageProps = {
        clothingProps: {
            savedClothes,
            selectedClothing,
            setSelectedClothing,
            activeCategory,
            setActiveCategory,
            clothingCategories,
            filteredClothes,
            newClothingForm,
            setNewClothingForm,
            newClothingFileState,
            handleNewClothingFileChange,
            handleClearNewClothingFile,
            handleLoadFromUrl,
            activeNewClothingTab,
            setActiveNewClothingTab,
            activeNewClothingInputTab,
            setActiveNewClothingInputTab,
            editingClothingName,
            setEditingClothingName,
            handleDeleteClothing,
            handleAddBackImage,
            handleOpenMaskEditorForNew,
            handleOpenMaskEditorForEdit,
            setEnlargedImage,
        },
        printsProps: {
            savedPrints,
            printsToShow,
            selectedPrintId,
            setSelectedPrintId,
            selectedPrintIdBack,
            setSelectedPrintIdBack,
            printUploadError: null,
            handlePrintFilesChange,
            handleDeletePrint,
            handleRemovePrintBg,
            isRemovingBackground,
            selectedClothing,
            setEnlargedImage,
            selectedPrintFront,
            onAddPrintClick: handleAddPrintClick,
            onPrintDrop: handlePrintDrop,
            onPrintDragOver: handlePrintDragOver,
            onPrintDragLeave: handlePrintDragLeave,
            isDraggingPrint: isDraggingPrint,
            printInputRef: printInputRef, // Pass the ref here
        } as CreatorPagePrintsProps,
        generationProps: {
            generationType,
            setGenerationType,
            generationAspectRatio,
            setGenerationAspectRatio,
            generationMode,
            setGenerationMode,
            selectedColor,
            setSelectedColor,
            customColors,
            handleAddCustomColor,
            blendMode,
            setBlendMode,
            backgroundTheme,
            setBackgroundTheme,
            customBackgroundFile,
            setCustomBackgroundFile,
            selectedPoses,
            handlePoseSelection,
            modelFilter,
            setModelFilter,
            promptSettings,
            customBgState,
            handleCustomBackgroundFileChange,
            selectedClothing,
            handleGenerateBackground,
            isGeneratingBackground,
            handleRevertBackground,
            handleSuggestColors,
            isSuggestingColors,
            suggestedPalettes,
        },
        actionsProps: {
            isLoading,
            isBatchingPreviews,
            error,
            handleGenerate,
            handleGenerateAssociationsBatch: handleGenerateAssociationsBatch,
            canGenerate,
            handleDownloadPreviewsAsZip,
            isZippingPreview,
        },
        uiProps: {
            precompositePreviewUrl,
            precompositePreviewUrlBack,
            precompositePreviewUrlBefore,
            setEnlargedImage,
            handleOpenMaskEditorForEdit,
            handleDownloadPreview,
            handleSavePreviewToHistory,
        },
        generationHistory,
        handleRestoreHistoryItem,
        setIsHistoryModalOpen,
        generatedImageUrls,
        setGeneratedImageUrls,
    };
    
    const renderPage = () => {
        if (generatedImageUrls.length > 0 && !isLoading) {
            return (
                <ResultDisplay
                    imageUrls={generatedImageUrls}
                    onReset={() => setGeneratedImageUrls([])}
                    clothingName={selectedClothing?.name}
                    printNameFront={selectedPrintFront?.name}
                    printNameBack={selectedPrintBack?.name}
                    generationMode={generationMode}
                    generationType={generationType}
                    isZipping={isZippingResultDisplay} // Pass the state
                    setIsZipping={setIsZippingResultDisplay} // Pass the setter
                />
            );
        }

        switch (activePage) {
            case 'creator':
                return <CreatorPage {...creatorPageProps} />;
            case 'gallery':
                return <GalleryPage history={generationHistory} onDelete={handleDeleteHistoryItem} onDeleteAll={handleDeleteAllHistory} onRestore={handleRestoreHistoryItem} />;
            case 'associations':
                return <AssociationsPage 
                    savedClothes={savedClothes} 
                    onUpdateClothing={handleUpdateClothing}
                    savedPrints={savedPrints} 
                    clothingCategories={clothingCategories}
                    onBatchExport={handleGeneratePreviewsBatch}
                    onDeleteClothing={handleDeleteClothing}
                    onRenameClothing={setEditingClothingName}
                    onUploadPrint={handlePrintFilesChange}
                    onBatchGenerateMockups={handleGenerateAssociationsBatch}
                    isBatchGenerating={!!batchGenerationStatus?.isActive}
                />;
            case 'settings':
                return <SettingsPage 
                    clothingCategories={clothingCategories} 
                    setClothingCategories={setClothingCategories}
                    promptSettings={promptSettings}
                    setPromptSettings={setPromptSettings}
                    defaultPromptSettings={defaultPromptSettings}
                />;
            case 'treatment':
                 return <ImageTreatmentPage
                    savedPrompts={savedImagePrompts}
                    setSavedPrompts={setSavedImagePrompts}
                />;
            case 'inspiration':
                return <InspirationGalleryPage onApplyStyle={handleApplyInspirationStyle} />;
            default:
                return <CreatorPage {...creatorPageProps} />;
        }
    };

    const leftNavWidth = isLeftNavExpanded ? 'w-60' : 'w-16';
    const rightSidebarWidth = isRightSidebarOpen && activePage === 'creator' ? 'w-80' : 'w-0';
    const mainContentMarginLeft = isLeftNavExpanded ? 'ml-60' : 'ml-16';
    const mainContentMarginRight = isRightSidebarOpen && activePage === 'creator' ? 'mr-80' : 'mr-0';


    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans flex">
            <LeftNavigation activePage={activePage} setActivePage={setActivePage} isExpanded={isLeftNavExpanded} setIsExpanded={setIsLeftNavExpanded} />

            <div className={`flex-grow transition-all duration-300 ease-in-out ${mainContentMarginLeft} ${mainContentMarginRight}`}>
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-md h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Criador de Mockups</h1>
                    </div>
                    <div className="flex items-center">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        {activePage === 'creator' && (
                            <button 
                                onClick={() => setIsRightSidebarOpen(prev => !prev)} 
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 ml-2"
                                title={isRightSidebarOpen ? "Esconder Painel de Configurações" : "Mostrar Painel de Configurações"}
                            >
                                <ChevronLeftIcon />
                            </button>
                        )}
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-grow">
                    {renderPage()}
                </main>
            </div>

            {/* Right Sidebar for CreatorPage settings */}
            {activePage === 'creator' && isRightSidebarOpen && (
                <div className={`fixed top-0 right-0 h-full bg-gray-100 dark:bg-gray-800 shadow-2xl z-40 flex flex-col transition-all duration-300 ease-in-out ${rightSidebarWidth}`}>
                    <div className="flex items-center justify-between h-16 bg-gray-200 dark:bg-gray-900 px-4 flex-shrink-0">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Configurações de Geração</h2>
                        <button 
                            onClick={() => setIsRightSidebarOpen(false)} 
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                            title="Fechar Painel"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <CreatorGenerationOptionsAndActionsSection 
                        generationProps={creatorPageProps.generationProps}
                        actionsProps={creatorPageProps.actionsProps}
                        printsProps={creatorPageProps.printsProps}
                    />
                </div>
            )}

            {/* Global Modals and Overlays */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <LoadingSpinner className="h-12 w-12 text-cyan-400" />
                    <p className="mt-4 text-white text-lg font-semibold animate-pulse">{loadingMessage}</p>
                </div>
            )}
            
            {batchGenerationStatus && (
                <BatchGenerationProgressModal 
                    status={batchGenerationStatus}
                    onCancel={handleCancelBatchGeneration}
                    onClose={() => setBatchGenerationStatus(null)} 
                />
            )}

            {(clothingToMask || clothingToEdit) && (
                <MaskCreator
                    imageUrl={clothingToMask?.dataUrl ?? (clothingToEdit?.isBack ? `data:${clothingToEdit.clothing.mimeTypeBack};base64,${clothingToEdit.clothing.base64Back}` : `data:${clothingToEdit?.clothing.mimeType};base64,${clothingToEdit?.clothing.base64}`)}
                    imageWidth={clothingToMask?.width ?? (clothingToEdit?.isBack ? clothingToEdit.clothing.widthBack : clothingToEdit?.clothing.width)!}
                    imageHeight={clothingToMask?.height ?? (clothingToEdit?.isBack ? clothingToEdit.clothing.heightBack : clothingToEdit?.clothing.height)!}
                    onSave={handleMaskSave}
                    onCancel={handleMaskCancel}
                    initialMask={clothingToEdit ? (clothingToEdit.isBack ? clothingToEdit.clothing.maskBack : clothingToEdit.clothing.mask) : null}
                    saveButtonText={clothingToEdit ? "Salvar Edição" : undefined}
                    savedMasks={savedMasks}
                    onSaveCurrentMask={handleSaveMask}
                    onDeleteSavedMask={handleDeleteSavedMask}
                    onUpdateSavedMask={handleUpdateSavedMask}
                />
            )}

            {enlargedImage && <Lightbox src={enlargedImage} onClose={() => setEnlargedImage(null)} />}

            {editingClothingName && (
                <EditClothingNameModal
                    clothing={editingClothingName}
                    onSave={handleUpdateClothingName}
                    onClose={() => setEditingClothingName(null)}
                />
            )}
            
            {isHistoryModalOpen && (
                <HistoryModal
                    history={generationHistory}
                    onClose={() => setIsHistoryModalOpen(false)}
                    onDelete={handleDeleteHistoryItem}
                    onDeleteAll={handleDeleteAllHistory}
                    onRestore={handleRestoreHistoryItem}
                />
            )}

            <input
                ref={addBackImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNewBackImageSelected}
            />
        </div>
    );
};

export default App;
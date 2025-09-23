import React, { useState, useMemo, useRef, useCallback, useEffect, memo } from 'react';
import { Print, SavedImagePrompt, TreatmentHistoryItem } from '../types';
import { editImage } from '../services/geminiService';
import { SparklesIcon, UploadIcon, LoadingSpinner, PencilIcon, TrashIcon, CheckIcon, DownloadIcon, RevertIcon, BookmarkIcon, MagicWandIcon, ImageIcon, PlusCircleIcon, HistoryIcon, AspectRatioOneOneIcon, AspectRatioThreeFourIcon, AspectRatioFourThreeIcon, AspectRatioNineSixteenIcon, AspectRatioSixteenNineIcon } from './Icons';
import { ZoomableImage } from './ZoomableImage';
import { ImageCompareSlider } from './ImageCompareSlider';
import { fileToBase64, pngDataUrlToJpgDataUrl, processAndValidateImageFile, downloadDataUrlAsJpg, getImageDimensionsFromUrl } from '../utils/fileUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- Memoized Child Components for Lists ---

// FIX: Explicitly defined props interface to resolve a TypeScript parsing issue with React.memo generics.
interface TreatmentPrintItemProps {
    print: Print;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}
const TreatmentPrintItem = memo(({ print, isSelected, onSelect, onDelete }: TreatmentPrintItemProps) => (
    <div 
        onClick={() => onSelect(print.id)}
        className={`relative group w-full flex items-center gap-3 p-2 rounded-lg text-left cursor-pointer border-l-4 ${isSelected ? 'border-cyan-500 bg-cyan-600/20' : 'border-transparent bg-gray-900/50 hover:bg-gray-700'}`}
    >
        <div className="flex items-center gap-3 flex-grow min-w-0">
            <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 p-1">
                <img src={`data:${print.mimeType};base64,${print.base64}`} alt={print.name} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-sm text-gray-300 truncate">{print.name}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(print.id); }} className="absolute top-1 right-1 p-1.5 bg-gray-800/50 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all" title="Remover Imagem">
            <TrashIcon />
        </button>
    </div>
));

// FIX: Refactored component definition to use inline prop types to resolve a potential TypeScript parsing issue with React.memo generics.
const AdditionalImageItem = memo(({ image, onRemove }: {
    image: Print;
    onRemove: (id: string) => void;
}) => (
    <div className="relative group aspect-square">
        <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Referência" className="w-full h-full object-cover rounded-md"/>
        <button 
            onClick={() => onRemove(image.id)} 
            className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
            title="Remover imagem de referência"
        >
            <TrashIcon />
        </button>
    </div>
));

// FIX: Refactored component definition to use inline prop types to resolve a potential TypeScript parsing issue with React.memo generics.
const SavedPromptItem = memo(({ prompt, onUse, onUpdate, onDelete }: {
    prompt: SavedImagePrompt;
    onUse: (prompt: SavedImagePrompt) => void;
    onUpdate: (id: string, newName: string) => boolean;
    onDelete: (id: string) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(prompt.name);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        setError(null);
        if (!editingName.trim()) {
            setError("O nome não pode estar vazio.");
            return;
        }
        const success = onUpdate(prompt.id, editingName.trim());
        if (success) {
            setIsEditing(false);
        } else {
            setError("Já existe um prompt com este nome.");
        }
    };

    return (
        <div className="group bg-gray-900/50 rounded-lg hover:bg-gray-700 transition-colors">
            {isEditing ? (
                <div className="p-3 w-full space-y-2">
                    <input
                        type="text" value={editingName}
                        onChange={(e) => { setEditingName(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className={`w-full bg-gray-600 border text-white text-sm rounded-md p-1 ${error ? 'border-red-500' : 'border-gray-500'}`}
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <div className="flex justify-end gap-2">
                         <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-600 px-3 py-1 rounded">Cancelar</button>
                         <button onClick={handleSave} className="text-xs bg-green-600 px-3 py-1 rounded">Salvar</button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center p-3">
                    <button onClick={() => onUse(prompt)} className="flex-grow text-left min-w-0">
                        <p className="font-semibold text-gray-300 text-sm truncate" title={prompt.name}>{prompt.name}</p>
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-white" title="Renomear"><PencilIcon/></button>
                        <button onClick={() => onDelete(prompt.id)} className="p-1 text-gray-400 hover:text-red-400" title="Deletar"><TrashIcon/></button>
                    </div>
                </div>
            )}
        </div>
    );
});

// FIX: Refactored component definition to use inline prop types to resolve a potential TypeScript parsing issue with React.memo generics.
const TreatmentHistoryItemCard = memo(({ item, onRestore, onDelete }: {
    item: TreatmentHistoryItem;
    onRestore: (item: TreatmentHistoryItem) => void;
    onDelete: (id: string) => void;
}) => (
    <div className="group flex items-center gap-3 p-2 rounded-lg bg-gray-900/50 hover:bg-gray-700 transition-colors">
        <div className="w-16 h-16 rounded-md flex-shrink-0 relative cursor-pointer" onClick={() => onRestore(item)}>
            <img 
                src={`data:${item.generatedImage.mimeType};base64,${item.generatedImage.base64}`} 
                alt="Histórico de imagem gerada" 
                className="w-full h-full object-cover rounded-md"
            />
             <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                <RevertIcon />
            </div>
        </div>
        <div className="flex-grow min-w-0">
            <p className="text-sm text-gray-400 truncate" title={item.prompt}>{item.prompt}</p>
            <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover do Histórico">
            <TrashIcon />
        </button>
    </div>
));


const VisualComposer = memo(({ baseImageSrc, onDraftChange }: { baseImageSrc: string | null, onDraftChange: (dataUrl: string | null) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tool, setTool] = useState<'brush' | 'rectangle'>('brush');
    const [color, setColor] = useState('#FFFFFF');
    const [size, setSize] = useState(5);

    const isDrawing = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const setCanvasSize = useCallback(async () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        if (baseImageSrc) {
            try {
                const dims = await getImageDimensionsFromUrl(baseImageSrc);
                const containerRect = container.getBoundingClientRect();
                const containerRatio = containerRect.width / containerRect.height;
                const imageRatio = dims.width / dims.height;

                let canvasWidth, canvasHeight;
                if (imageRatio > containerRatio) {
                    canvasWidth = containerRect.width;
                    canvasHeight = containerRect.width / imageRatio;
                } else {
                    canvasHeight = containerRect.height;
                    canvasWidth = containerRect.height * imageRatio;
                }
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            } catch (e) {
                console.error("Could not load image for canvas sizing", e);
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        } else {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        
        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            contextRef.current = context;
        }
    }, [baseImageSrc]);

    useEffect(() => {
        setCanvasSize();
        const observer = new ResizeObserver(setCanvasSize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [setCanvasSize]);
    
    useEffect(() => {
        const ctx = contextRef.current;
        if(ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
        }
    }, [color, size]);

    const updateDraft = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        const isEmpty = !pixelBuffer.some(c => c !== 0);
        onDraftChange(isEmpty ? null : canvas.toDataURL('image/png'));
    }, [onDraftChange]);

    const getMousePos = (e: React.MouseEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = useCallback((e: React.MouseEvent) => {
        const ctx = contextRef.current;
        if (!ctx) return;
        isDrawing.current = true;
        const pos = getMousePos(e);
        startPos.current = pos;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }, []);

    const draw = useCallback((e: React.MouseEvent) => {
        if (!isDrawing.current) return;
        const ctx = contextRef.current;
        if (!ctx) return;
        const pos = getMousePos(e);
        if (tool === 'brush') {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    }, [tool]);

    const stopDrawing = useCallback((e: React.MouseEvent) => {
        if (!isDrawing.current) return;
        const ctx = contextRef.current;
        if (!ctx) return;
        
        if (tool === 'rectangle') {
            const pos = getMousePos(e);
            ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
        }
        
        ctx.closePath();
        isDrawing.current = false;
        updateDraft();
    }, [tool, updateDraft]);

    const handleClear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateDraft();
        }
    }, [updateDraft]);
    
    const colors = ['#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#007AFF', '#5856D6'];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-900/50 rounded-md">
                <div className="flex items-center gap-2">
                    <button onClick={() => setTool('brush')} className={`p-2 rounded ${tool === 'brush' ? 'bg-purple-600' : 'bg-gray-700'}`}><PencilIcon /></button>
                    <button onClick={() => setTool('rectangle')} className={`p-2 rounded ${tool === 'rectangle' ? 'bg-purple-600' : 'bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" /></svg></button>
                    <div className="h-6 w-px bg-gray-600"></div>
                     {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
                     <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded-full cursor-pointer bg-transparent" style={{'--color': color} as React.CSSProperties} />
                </div>
                 <div className="flex items-center gap-2">
                    <input type="range" min="1" max="50" value={size} onChange={e => setSize(Number(e.target.value))} className="w-24"/>
                    <button onClick={handleClear} className="p-2 bg-red-600/50 rounded hover:bg-red-600/80"><TrashIcon/></button>
                </div>
            </div>
            <div ref={containerRef} className="relative w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                {baseImageSrc && <img src={baseImageSrc} alt="fundo do rascunho" className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none" />}
                <canvas ref={canvasRef} className="absolute" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
            </div>
        </div>
    );
});


// --- Main Page Component ---

interface ImageTreatmentPageProps {
    savedPrompts: SavedImagePrompt[];
    setSavedPrompts: React.Dispatch<React.SetStateAction<SavedImagePrompt[]>>;
}

export const ImageTreatmentPage: React.FC<ImageTreatmentPageProps> = ({
    savedPrompts,
    setSavedPrompts,
}) => {
    // --- State moved from App.tsx ---
    const [treatmentPrints, setTreatmentPrints] = useLocalStorage<Print[]>('ai-mockup-treatment-prints', []);
    const [treatmentSelectedPrintId, setTreatmentSelectedPrintId] = useLocalStorage<string | null>('ai-mockup-treatment-selected-print-id', null);
    const [treatmentHistory, setTreatmentHistory] = useLocalStorage<TreatmentHistoryItem[]>('ai-clothing-mockup-treatment-history', []);
    const [treatmentCurrentPrompt, setTreatmentCurrentPrompt] = useState<string>('');
    const [treatmentGeneratedImage, setTreatmentGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [treatmentAdditionalImages, setTreatmentAdditionalImages] = useState<Print[]>([]);

    // --- Local component state ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSavingPrompt, setIsSavingPrompt] = useState(false);
    const [newPromptName, setNewPromptName] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);
    const printInputRef = useRef<HTMLInputElement>(null);
    const additionalImagesInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingPrint, setIsDraggingPrint] = useState<boolean>(false);
    const [draftDataUrl, setDraftDataUrl] = useState<string | null>(null);

    const selectedPrint = useMemo(() => treatmentPrints.find(p => p.id === treatmentSelectedPrintId), [treatmentPrints, treatmentSelectedPrintId]);

    useEffect(() => {
        if (treatmentSelectedPrintId && !treatmentPrints.some(p => p.id === treatmentSelectedPrintId)) {
            setTreatmentSelectedPrintId(treatmentPrints.length > 0 ? treatmentPrints[0].id : null);
        } else if (!treatmentSelectedPrintId && treatmentPrints.length > 0) {
            setTreatmentSelectedPrintId(treatmentPrints[0].id);
        }
    }, [treatmentPrints, treatmentSelectedPrintId, setTreatmentSelectedPrintId]);

    const displayImageUrl = useMemo(() => {
        if (treatmentGeneratedImage) {
            return `data:${treatmentGeneratedImage.mimeType};base64,${treatmentGeneratedImage.base64}`;
        }
        if (selectedPrint) {
            return `data:${selectedPrint.mimeType};base64,${selectedPrint.base64}`;
        }
        return null;
    }, [selectedPrint, treatmentGeneratedImage]);

    // --- Handlers moved from App.tsx ---
      const handleTreatmentPrintFilesChange = useCallback(async (files: FileList) => {
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
        setTreatmentPrints(prev => [...prev, ...newPrints]);
        }
        if (uploadErrors.length > 0) {
        console.error("Treatment print upload errors:", uploadErrors.join('\n'));
        }
    }, [setTreatmentPrints]);

    const handleDeleteTreatmentPrint = useCallback((idToDelete: string) => {
        setTreatmentPrints(prevPrints => {
            const remainingPrints = prevPrints.filter(p => p.id !== idToDelete);
            
            if (treatmentSelectedPrintId === idToDelete) {
                const newSelectedId = remainingPrints.length > 0 ? remainingPrints[0].id : null;
                setTreatmentSelectedPrintId(newSelectedId);
                setTreatmentGeneratedImage(null);
                setTreatmentAdditionalImages([]);
            }
            
            return remainingPrints;
        });

        setTreatmentAdditionalImages(prev => prev.filter(p => p.id !== idToDelete));
    }, [treatmentSelectedPrintId, setTreatmentPrints, setTreatmentSelectedPrintId, setTreatmentGeneratedImage, setTreatmentAdditionalImages]);

    const handleDeleteAllTreatmentPrints = useCallback(() => {
        if (window.confirm("Tem certeza de que deseja excluir TODAS as imagens de tratamento? Esta ação não pode ser desfeita.")) {
            setTreatmentPrints([]);
            setTreatmentSelectedPrintId(null);
            setTreatmentGeneratedImage(null);
            setTreatmentAdditionalImages([]);
        }
    }, [setTreatmentPrints, setTreatmentSelectedPrintId, setTreatmentGeneratedImage, setTreatmentAdditionalImages]);

    const handleDeleteTreatmentHistoryItem = useCallback((id: string) => {
        if (window.confirm("Deseja excluir este item do histórico?")) {
            setTreatmentHistory(prev => prev.filter(item => item.id !== id));
        }
    }, [setTreatmentHistory]);

    // --- Component specific handlers ---
    const handleSelectPrint = useCallback((id: string) => {
        if (treatmentSelectedPrintId !== id) {
            setTreatmentSelectedPrintId(id);
            setTreatmentGeneratedImage(null);
            setError(null);
            setTreatmentAdditionalImages([]);
        }
    }, [treatmentSelectedPrintId, setTreatmentSelectedPrintId, setTreatmentGeneratedImage, setError, setTreatmentAdditionalImages]);
    
    const promptPhraseMap: Record<string, string> = useMemo(() => ({
        // Styles
        'Vintage': 'vintage retro style, aged photo effect',
        'Minimalista': 'clean minimalist style, simple background',
        'Boho Chic': 'boho chic aesthetic, earthy tones, natural elements',
        'Esportivo': 'sporty athletic vibe, dynamic',
        'Aquarela': 'watercolor painting style, soft edges',
        'Fantasia Épica': 'epic fantasy art, dramatic lighting, detailed',
        'Arte Abstrata': 'abstract art, non-representational, focus on color and form',
        'Vaporwave': 'vaporwave aesthetic, neon and pastel colors, retro-futuristic',
        // Poses
        'Pose de ação': 'in an action pose',
        'Relaxado': 'in a relaxed pose',
        'Olhando para a câmera': 'looking at the camera',
        'De costas': 'seen from the back',
        'Andando': 'walking casually',
        // Lighting
        'Luz de estúdio': 'professional studio lighting',
        'Luz do dia': 'bright daylight',
        'Pôr do sol': 'golden hour sunset lighting',
        'Neon': 'lit by neon lights',
        'Cinemática': 'cinematic lighting'
    }), []);

    const promptCategories = useMemo(() => {
        const styleChips = ['Vintage', 'Minimalista', 'Boho Chic', 'Esportivo', 'Aquarela', 'Fantasia Épica', 'Arte Abstrata', 'Vaporwave'];
        const poseChips = ['Pose de ação', 'Relaxado', 'Olhando para a câmera', 'De costas', 'Andando'];
        const lightingChips = ['Luz de estúdio', 'Luz do dia', 'Pôr do sol', 'Neon', 'Cinemática'];
        
        return {
            style: styleChips.map(chip => promptPhraseMap[chip]),
            pose: poseChips.map(chip => promptPhraseMap[chip]),
            lighting: lightingChips.map(chip => promptPhraseMap[chip])
        };
    }, [promptPhraseMap]);

    const handlePromptChipClick = useCallback((chipText: string, category: keyof typeof promptCategories) => {
        const newPhrase = promptPhraseMap[chipText];
        if (!newPhrase) return;

        const phrasesToRemove = promptCategories[category];

        setTreatmentCurrentPrompt(prev => {
            let promptParts = prev.split(',').map(p => p.trim()).filter(Boolean);
            
            // Remove all phrases from the same category
            promptParts = promptParts.filter(part => !phrasesToRemove.includes(part));

            // Add the new phrase if it's not already there (for toggle-off behavior)
            const isAlreadyActive = prev.includes(newPhrase);
            if (!isAlreadyActive) {
                promptParts.push(newPhrase);
            }

            return promptParts.join(', ');
        });
    }, [promptCategories, promptPhraseMap]);

    const handleGenerate = useCallback(async () => {
        if (!selectedPrint || !treatmentCurrentPrompt.trim()) {
            setError("Por favor, selecione uma imagem e escreva um prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const mainImage = { base64: selectedPrint.base64, mimeType: selectedPrint.mimeType };
            const additionalImageData = treatmentAdditionalImages.map(img => ({ base64: img.base64, mimeType: img.mimeType }));
            const draftImage = draftDataUrl ? { base64: draftDataUrl.split(',')[1], mimeType: 'image/png' } : undefined;
            
            const resultBase64 = await editImage(mainImage, additionalImageData, treatmentCurrentPrompt, draftImage);
            
            const newGeneratedImage = { base64: resultBase64, mimeType: 'image/png' };
            setTreatmentGeneratedImage(newGeneratedImage);

            const newHistoryItem: TreatmentHistoryItem = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                originalPrintId: selectedPrint.id,
                generatedImage: newGeneratedImage,
                prompt: treatmentCurrentPrompt,
                additionalImages: treatmentAdditionalImages,
            };
            setTreatmentHistory(prev => [newHistoryItem, ...prev].slice(0, 50));

        } catch (e) {
            setError(e instanceof Error ? e.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPrint, treatmentCurrentPrompt, treatmentAdditionalImages, draftDataUrl, setTreatmentGeneratedImage, setError, setTreatmentHistory]);
    
    const handleSavePrompt = useCallback(() => {
        setSaveError(null);
        if (!treatmentCurrentPrompt.trim()) {
            setSaveError("O prompt não pode estar vazio.");
            return;
        }
        if (!newPromptName.trim()) {
            setSaveError("O nome do prompt é obrigatório.");
            return;
        }
        if (savedPrompts.some(p => p.name.toLowerCase() === newPromptName.trim().toLowerCase())) {
            setSaveError("Já existe um prompt com este nome.");
            return;
        }

        const newSavedPrompt: SavedImagePrompt = {
            id: crypto.randomUUID(),
            name: newPromptName.trim(),
            prompt: treatmentCurrentPrompt.trim(),
        };
        setSavedPrompts(prev => [newSavedPrompt, ...prev]);
        setNewPromptName('');
        setIsSavingPrompt(false);
    }, [treatmentCurrentPrompt, newPromptName, savedPrompts, setSavedPrompts]);

    const handleUpdatePrompt = useCallback((id: string, newName: string): boolean => {
        if (savedPrompts.some(p => p.id !== id && p.name.toLowerCase() === newName.toLowerCase())) {
            return false;
        }
        setSavedPrompts(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
        return true;
    }, [savedPrompts, setSavedPrompts]);

    const handleDeletePrompt = useCallback((id: string) => {
        if (window.confirm("Tem certeza que deseja deletar este prompt?")) {
            setSavedPrompts(prev => prev.filter(p => p.id !== id));
        }
    }, [setSavedPrompts]);

    const handleUsePrompt = useCallback((prompt: SavedImagePrompt) => {
        setTreatmentCurrentPrompt(prompt.prompt);
    }, [setTreatmentCurrentPrompt]);
    
    const handlePrintDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingPrint(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleTreatmentPrintFilesChange(e.dataTransfer.files);
        }
    }, [handleTreatmentPrintFilesChange]);

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
    
    const handleDownload = useCallback(async () => {
        if (!displayImageUrl || !selectedPrint) return;
        const filename = `${selectedPrint.name.replace(/\.[^/.]+$/, "")}_editado`;
        await downloadDataUrlAsJpg(displayImageUrl, filename, 0.95);
    }, [displayImageUrl, selectedPrint]);
    
    const handleAdditionalImagesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        const currentCount = treatmentAdditionalImages.length;
        const limit = 4;
        
        if (files.length + currentCount > limit) {
            setError(`Você pode adicionar no máximo ${limit} imagens de referência.`);
            return;
        }

        setIsLoading(true);
        const newImages: Print[] = [];
        for (const file of files) {
            try {
                const validatedFile = await processAndValidateImageFile(file);
                const base64 = await fileToBase64(validatedFile);
                newImages.push({
                    id: crypto.randomUUID(),
                    name: validatedFile.name,
                    base64,
                    mimeType: validatedFile.type,
                    hasBgRemoved: false,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : `Erro ao carregar ${file.name}`);
            }
        }
        setTreatmentAdditionalImages(prev => [...prev, ...newImages]);
        setIsLoading(false);
    }, [treatmentAdditionalImages, setTreatmentAdditionalImages, setError]);

    const handleRemoveAdditionalImage = useCallback((id: string) => {
        setTreatmentAdditionalImages(prev => prev.filter(img => img.id !== id));
    }, [setTreatmentAdditionalImages]);

    const handleRestoreHistoryItem = useCallback((item: TreatmentHistoryItem) => {
        setTreatmentSelectedPrintId(item.originalPrintId);
        setTreatmentGeneratedImage(item.generatedImage);
        setTreatmentCurrentPrompt(item.prompt);
        setTreatmentAdditionalImages(item.additionalImages);
        setError(null);
    }, [setTreatmentSelectedPrintId, setTreatmentGeneratedImage, setTreatmentCurrentPrompt, setTreatmentAdditionalImages, setError]);

    const handleApplyRatioShortcut = useCallback((ratio: string) => {
        setTreatmentCurrentPrompt(p => (p.trim() + `\n- Mude a proporção da imagem para ${ratio}.`).trim())
    }, [setTreatmentCurrentPrompt]);

    const renderPromptChip = (text: string, category: keyof typeof promptCategories) => {
        const phrase = promptPhraseMap[text];
        const isActive = treatmentCurrentPrompt.includes(phrase);
        return (
            <button
                key={text}
                onClick={() => handlePromptChipClick(text, category)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
                {text}
            </button>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Coluna 1: Imagens */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                            <ImageIcon /> Imagens
                        </h2>
                        <button onClick={handleDeleteAllTreatmentPrints} className="text-xs text-gray-400 hover:text-red-400 hover:underline" title="Remover todas as imagens">
                            Limpar Tudo
                        </button>
                    </div>
                    <div onDrop={handlePrintDrop} onDragOver={handlePrintDragOver} onDragLeave={handlePrintDragLeave} className={`w-full border-2 border-dashed rounded-md p-4 text-center text-gray-400 transition-colors mb-4 ${isDraggingPrint ? 'border-purple-400 bg-purple-900/20' : 'border-gray-600 hover:border-cyan-500 hover:text-cyan-400'}`}>
                        <button onClick={() => printInputRef.current?.click()} className="w-full">
                            <UploadIcon className="h-6 w-6 mx-auto mb-1" /> Adicionar Imagem
                        </button>
                    </div>
                    <input ref={printInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleTreatmentPrintFilesChange(e.target.files)} />
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {treatmentPrints.length > 0 ? treatmentPrints.map(p => (
                            <TreatmentPrintItem 
                                key={p.id}
                                print={p}
                                isSelected={treatmentSelectedPrintId === p.id}
                                onSelect={handleSelectPrint}
                                onDelete={handleDeleteTreatmentPrint}
                            />
                        )) : (
                            <p className="text-center text-sm text-gray-500 py-4">Nenhuma imagem para tratar.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Coluna 2: Preview & Composer */}
            <div className="lg:col-span-6 flex flex-col gap-4">
                 <div className="relative w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                    {displayImageUrl ? (
                        treatmentGeneratedImage && selectedPrint ? (
                            <ImageCompareSlider 
                                beforeSrc={`data:${selectedPrint.mimeType};base64,${selectedPrint.base64}`}
                                afterSrc={displayImageUrl}
                                alt="Comparação de tratamento"
                            />
                        ) : (
                            <ZoomableImage src={displayImageUrl} alt="Imagem para tratar" />
                        )
                    ) : (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2"/>
                            <p>Adicione uma imagem para começar</p>
                        </div>
                    )}
                    
                    {displayImageUrl && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                             <button onClick={handleDownload} className="bg-gray-800/70 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all" title="Baixar Resultado">
                                <DownloadIcon />
                            </button>
                            {treatmentGeneratedImage && (
                                <button onClick={() => setTreatmentGeneratedImage(null)} className="bg-gray-800/70 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all" title="Reverter para Original">
                                    <RevertIcon />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg">
                    <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2 mb-1">
                        <PencilIcon /> Controle de Composição Visual
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">Desenhe um rascunho para guiar a IA na disposição dos elementos.</p>
                    <VisualComposer baseImageSrc={displayImageUrl} onDraftChange={setDraftDataUrl} />
                </div>
            </div>

            {/* Coluna 3: Controles */}
            <div className="lg:col-span-4 space-y-4">
                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg space-y-4">
                    <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2"><SparklesIcon/> Painel de Tratamento</h2>
                    
                    <div>
                        <label htmlFor="prompt-textarea" className="text-sm font-semibold text-gray-300 mb-1 block">Prompt de Edição</label>
                        <textarea
                            id="prompt-textarea"
                            rows={4}
                            value={treatmentCurrentPrompt}
                            onChange={e => setTreatmentCurrentPrompt(e.target.value)}
                            placeholder="Descreva a modificação ou clique nos assistentes abaixo..."
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 text-sm font-mono focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Assistente de Prompt</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Estilo:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Vintage', 'Minimalista', 'Boho Chic', 'Esportivo', 'Aquarela', 'Fantasia Épica', 'Arte Abstrata', 'Vaporwave'].map(style => renderPromptChip(style, 'style'))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Pose:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Pose de ação', 'Relaxado', 'Olhando para a câmera', 'De costas', 'Andando'].map(pose => renderPromptChip(pose, 'pose'))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 mb-1">Iluminação:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Luz de estúdio', 'Luz do dia', 'Pôr do sol', 'Neon', 'Cinemática'].map(light => renderPromptChip(light, 'lighting'))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-300">Imagens de Referência (Opcional, máx. 4)</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {treatmentAdditionalImages.map(img => (
                                <AdditionalImageItem key={img.id} image={img} onRemove={handleRemoveAdditionalImage} />
                            ))}
                            {treatmentAdditionalImages.length < 4 && (
                                <button 
                                    onClick={() => additionalImagesInputRef.current?.click()}
                                    className="aspect-square flex flex-col items-center justify-center bg-gray-900/50 rounded-md border-2 border-dashed border-gray-700 hover:border-cyan-500 text-gray-500 hover:text-cyan-400"
                                >
                                    <PlusCircleIcon />
                                    <span className="text-xs mt-1">Adicionar</span>
                                </button>
                            )}
                        </div>
                        <input ref={additionalImagesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImagesChange} />
                    </div>

                     <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Atalhos de Proporção</h3>
                        <div className="grid grid-cols-5 gap-2 text-gray-800 dark:text-white">
                            <button onClick={() => handleApplyRatioShortcut('1:1')} className="p-2 rounded-md flex justify-center items-center bg-gray-700" title="1:1 (Quadrado)"><AspectRatioOneOneIcon /></button>
                            <button onClick={() => handleApplyRatioShortcut('3:4')} className="p-2 rounded-md flex justify-center items-center bg-gray-700" title="3:4 (Retrato)"><AspectRatioThreeFourIcon /></button>
                            <button onClick={() => handleApplyRatioShortcut('4:3')} className="p-2 rounded-md flex justify-center items-center bg-gray-700" title="4:3 (Paisagem)"><AspectRatioFourThreeIcon /></button>
                            <button onClick={() => handleApplyRatioShortcut('9:16')} className="p-2 rounded-md flex justify-center items-center bg-gray-700" title="9:16 (Stories)"><AspectRatioNineSixteenIcon /></button>
                            <button onClick={() => handleApplyRatioShortcut('16:9')} className="p-2 rounded-md flex justify-center items-center bg-gray-700" title="16:9 (Widescreen)"><AspectRatioSixteenNineIcon /></button>
                        </div>
                    </div>


                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !selectedPrint || !treatmentCurrentPrompt.trim()}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-500 transition-all flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner/> : <MagicWandIcon/>}
                        {isLoading ? 'Gerando...' : 'Aplicar Tratamento'}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>

                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
                    <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                       <BookmarkIcon/> Prompts Salvos
                    </h2>
                    {isSavingPrompt ? (
                        <div className="space-y-2 bg-gray-900/50 p-3 rounded-lg">
                            <input 
                                type="text" 
                                value={newPromptName} 
                                onChange={e => { setNewPromptName(e.target.value); setSaveError(null); }}
                                onKeyDown={e => e.key === 'Enter' && handleSavePrompt()}
                                placeholder="Nome para este prompt" 
                                className={`w-full bg-gray-600 border text-white text-sm rounded-md p-1 ${saveError ? 'border-red-500' : 'border-gray-500'}`}
                                autoFocus
                            />
                            {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsSavingPrompt(false)} className="text-xs bg-gray-600 px-3 py-1 rounded">Cancelar</button>
                                <button onClick={handleSavePrompt} className="text-xs bg-green-600 px-3 py-1 rounded">Salvar</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsSavingPrompt(true)} disabled={!treatmentCurrentPrompt.trim()} className="w-full text-sm bg-purple-600/50 text-white py-2 rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                            Salvar Prompt Atual
                        </button>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {savedPrompts.map(p => (
                           <SavedPromptItem 
                             key={p.id}
                             prompt={p}
                             onUse={handleUsePrompt}
                             onUpdate={handleUpdatePrompt}
                             onDelete={handleDeletePrompt}
                           />
                        ))}
                    </div>
                </div>

                 <div className="bg-gray-800 rounded-2xl p-4 shadow-lg space-y-3">
                     <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                        <HistoryIcon/> Histórico de Tratamentos
                    </h2>
                     <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {treatmentHistory.length > 0 ? treatmentHistory.map(item => (
                            <TreatmentHistoryItemCard 
                                key={item.id}
                                item={item}
                                onRestore={handleRestoreHistoryItem}
                                onDelete={handleDeleteTreatmentHistoryItem}
                            />
                        )) : <p className="text-center text-sm text-gray-500 py-4">Nenhum histórico.</p>}
                    </div>
                 </div>
            </div>
        </div>
    );
};
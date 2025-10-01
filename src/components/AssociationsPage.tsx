import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import JSZip from 'jszip';
import { SavedClothing, Print, PrintCombination } from '../types';
import { createPrecompositeImage, downloadDataUrlAsJpg, pngDataUrlToJpgDataUrl } from '../utils/fileUtils';
import { LoadingSpinner, PencilIcon, BookmarkIcon, TrashIcon, ZipIcon, PlusCircleIcon, MinusCircleIcon, DownloadIcon, UploadIcon, UsersIcon, MagicWandIcon } from './Icons';

const AssociationPreview = memo<{ clothing: SavedClothing; print: Print | undefined, side: 'front' | 'back' }>(({ clothing, print, side }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setPreviewUrl(null); // Reset preview URL on dependency change

        const generate = async () => {
            // Add a small delay to allow browser to catch up, if many renders happen quickly
            await new Promise(resolve => setTimeout(resolve, 50)); 
            if (!isMounted) return;

            if (!print) {
                const sideImage = side === 'front' ? `data:${clothing.mimeType};base64,${clothing.base64}` : (clothing.base64Back ? `data:${clothing.mimeTypeBack};base64,${clothing.base64Back}`: null);
                if (isMounted) {
                    setPreviewUrl(sideImage);
                    setIsLoading(false);
                }
                return;
            }

            const clothingBase = side === 'front' ? clothing.base64 : clothing.base64Back;
            const clothingMime = side === 'front' ? clothing.mimeType : clothing.mimeTypeBack;
            const clothingMask = side === 'front' ? clothing.mask : clothing.maskBack;
            const clothingW = side === 'front' ? clothing.width : clothing.widthBack;
            const clothingH = side === 'front' ? clothing.height : clothing.heightBack;

            if (!clothingBase || !clothingMime || !clothingW || !clothingH) {
                if (isMounted) setIsLoading(false);
                return;
            }

            try {
                const url = await createPrecompositeImage(
                    `data:${clothingMime};base64,${clothingBase}`,
                    `data:${print.mimeType};base64,${print.base64}`,
                    clothingMask,
                    { width: clothingW, height: clothingH },
                    'original', null, 'Normal'
                );
                if (isMounted) {
                    setPreviewUrl(url);
                }
            } catch (e) {
                console.error(`[AssociationPreview] Preview failed for ${clothing.name} (${side}) with print ${print.name}:`, e);
                const sideImage = side === 'front' ? `data:${clothing.mimeType};base64,${clothing.base64}` : (clothing.base64Back ? `data:${clothing.mimeTypeBack};base64,${clothing.base64Back}`: null);
                if (isMounted) setPreviewUrl(sideImage); // Fallback to clothing image
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        generate();
        return () => { isMounted = false; };
    }, [clothing, print, side]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md">
                <LoadingSpinner />
            </div>
        );
    }

    if (!previewUrl) {
         return <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md" />;
    }

    return <img src={previewUrl} alt={print?.name || "Preview"} className="w-full h-full object-cover rounded-md" />;
});


const CombinationCounter = memo<{ combinations: PrintCombination[] }>(({ combinations }) => {
    const totalCombos = combinations.length;
    const frontCount = combinations.reduce((acc, combo) => acc + combo.slots.filter(s => s.type === 'front').length, 0);
    const backCount = combinations.reduce((acc, combo) => acc + combo.slots.filter(s => s.type === 'back').length, 0);

    return (
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg">
            <span><strong>{totalCombos}</strong> {totalCombos === 1 ? 'Combinação' : 'Combinações'}</span>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2" title="Pré-visualizações da Frente">
                <span className="text-cyan-500 dark:text-cyan-300 font-extrabold text-lg">F</span>
                <span>{frontCount}</span>
            </div>
             <div className="flex items-center gap-2" title="Pré-visualizações das Costas">
                <span className="text-violet-500 dark:text-violet-300 font-extrabold text-lg">C</span>
                <span>{backCount}</span>
            </div>
        </div>
    );
});


const VisualPrintSelector = memo<{
    title: string;
    prints: Print[];
    selectedPrintId: string | null;
    onSelect: (printId: string | null) => void;
    onUpload: (files: FileList) => void;
}>(({ title, prints, selectedPrintId, onSelect, onUpload }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedPrint = useMemo(() => prints.find(p => p.id === selectedPrintId), [prints, selectedPrintId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (printId: string | null) => {
        onSelect(printId);
        setIsOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onUpload(e.target.files);
        }
    };

    return (
        <div>
            <h4 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
            <div className="relative" ref={wrapperRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2 flex items-center justify-between"
                >
                    {selectedPrint ? (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-800 rounded-sm flex items-center justify-center flex-shrink-0">
                                <img src={`data:${selectedPrint.mimeType};base64,${selectedPrint.base64}`} alt={selectedPrint.name} className="max-w-full max-h-full object-contain"/>
                            </div>
                            <span className="text-sm truncate">{selectedPrint.name}</span>
                        </div>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">Nenhuma</span>
                    )}
                    <svg className={`fill-current h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </button>
                {isOpen && (
                    <div className="absolute z-10 top-full mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-2">
                        <div className="grid grid-cols-6 gap-2">
                             <button
                                onClick={() => handleSelect(null)}
                                className={`aspect-square rounded-md flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 transition-colors ${!selectedPrintId ? 'bg-cyan-600/30 ring-2 ring-cyan-500' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                             >
                                Nenhuma
                             </button>
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-md flex flex-col items-center justify-center text-xs text-cyan-500 dark:text-cyan-400 transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                              >
                                <UploadIcon className="h-5 w-5 mb-0.5" />
                                Adicionar
                             </button>
                            {prints.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(p.id)}
                                    className={`aspect-square rounded-md transition-all p-1 ${selectedPrintId === p.id ? 'ring-2 ring-cyan-500 scale-105 bg-gray-100 dark:bg-gray-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <img src={`data:${p.mimeType};base64,${p.base64}`} alt={p.name} title={p.name} className="w-full h-full object-contain"/>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
});


const ClothingAssociationCard = memo<{
  clothing: SavedClothing;
  savedPrints: Print[];
  onRenameClothing: (clothing: SavedClothing) => void;
  onUpdateClothing: (clothingId: string, updates: Partial<SavedClothing>) => Promise<void>;
  onDeleteClothing: (clothingId: string) => void;
  onExportCombination: (clothing: SavedClothing, combination: PrintCombination) => Promise<void>;
  onPreviewDownload: (clothing: SavedClothing, print: Print | undefined, side: 'front' | 'back') => Promise<void>;
  onUploadPrint: (files: FileList) => void;
}>(({
    clothing, savedPrints, onRenameClothing, onUpdateClothing, onDeleteClothing,
    onExportCombination, onPreviewDownload, onUploadPrint
}) => {
    const [editingCombination, setEditingCombination] = useState<{ comboId: string; name: string } | null>(null);
    
    const handleToggleMinimize = () => {
        onUpdateClothing(clothing.id, { isMinimizedInAssociations: !clothing.isMinimizedInAssociations });
    };

    const handleAddCombination = () => {
        const newCombination: PrintCombination = {
            id: crypto.randomUUID(),
            name: `Combinação #${clothing.printCombinations.length + 1}`,
            slots: [{ id: crypto.randomUUID(), type: 'front', printId: null }]
        };
        onUpdateClothing(clothing.id, { printCombinations: [...clothing.printCombinations, newCombination] });
    };

    const handleDeleteCombination = (comboId: string) => {
        const newCombinations = clothing.printCombinations.filter(combo => combo.id !== comboId);
        onUpdateClothing(clothing.id, { printCombinations: newCombinations });
    };

    const handleUpdateCombinationName = () => {
        if (!editingCombination) return;
        const { comboId, name } = editingCombination;
        const newCombinations = clothing.printCombinations.map(combo => 
            combo.id === comboId ? { ...combo, name } : combo
        );
        onUpdateClothing(clothing.id, { printCombinations: newCombinations });
        setEditingCombination(null);
    };

    const handleAddSlotToCombination = (comboId: string, type: 'front' | 'back') => {
        const newCombinations = clothing.printCombinations.map(combo => 
            combo.id === comboId ? { ...combo, slots: [...combo.slots, { id: crypto.randomUUID(), type, printId: null }] } : combo
        );
        onUpdateClothing(clothing.id, { printCombinations: newCombinations });
    };

    const handleDeleteSlotFromCombination = (comboId: string, slotId: string) => {
        const newCombinations = clothing.printCombinations.map(combo => 
            combo.id === comboId ? { ...combo, slots: combo.slots.filter(slot => slot.id !== slotId) } : combo
        );
        onUpdateClothing(clothing.id, { printCombinations: newCombinations });
    };

    const handleUpdateSlotPrint = (comboId: string, slotId: string, printId: string | null) => {
        const newCombinations = clothing.printCombinations.map(combo => 
            combo.id === comboId ? { ...combo, slots: combo.slots.map(slot => 
                slot.id === slotId ? { ...slot, printId } : slot
            )} : combo
        );
        onUpdateClothing(clothing.id, { printCombinations: newCombinations });
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg space-y-6 transition-all duration-300`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 min-w-0">
                    <img src={`data:${clothing.mimeType};base64,${clothing.base64}`} alt={clothing.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"/>
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={clothing.name}>{clothing.name}</h2>
                        <button onClick={() => onRenameClothing(clothing)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors flex-shrink-0" title="Renomear Roupa">
                            <PencilIcon />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CombinationCounter combinations={clothing.printCombinations} />
                    <button onClick={handleToggleMinimize} className={`font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-sm ${clothing.isMinimizedInAssociations ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                        {clothing.isMinimizedInAssociations ?  <><PencilIcon/> Editar</> : <><BookmarkIcon /> Salvar</> }
                    </button>
                    <button onClick={() => onDeleteClothing(clothing.id)} className="p-2.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Deletar Roupa"><TrashIcon /></button>
                </div>
            </div>
            
            {!clothing.isMinimizedInAssociations && (
                <div className="space-y-8 animate-fade-in">
                    {clothing.printCombinations.map((combo) => {
                        const usedPrintIdsInCombo = new Set(combo.slots.map(s => s.printId).filter(Boolean));

                        return (
                            <div key={combo.id} className="bg-gray-100/40 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        {editingCombination?.comboId === combo.id ? (
                                            <input
                                                type="text"
                                                value={editingCombination.name}
                                                onChange={(e) => setEditingCombination({ comboId: combo.id, name: e.target.value })}
                                                onBlur={handleUpdateCombinationName}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCombinationName()}
                                                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 font-semibold"
                                                autoFocus
                                            />
                                        ) : (
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{combo.name}</h3>
                                        )}
                                        <button onClick={() => setEditingCombination({ comboId: combo.id, name: combo.name })} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"><PencilIcon /></button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onExportCombination(clothing, combo)} className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-3 rounded-md text-sm hover:bg-purple-500"><ZipIcon /> Exportar</button>
                                        <button onClick={() => handleDeleteCombination(combo.id)} className="p-2 rounded-md bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors" title="Deletar Combinação"><TrashIcon /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-5 space-y-4">
                                        {combo.slots.map((slot, index) => (
                                            <div key={slot.id} className="flex items-center gap-3">
                                                <div className="flex-grow">
                                                    <VisualPrintSelector
                                                        title={slot.type === 'front' ? `Frente ${combo.slots.filter(s => s.type === 'front').length > 1 ? `#${index+1}` : ''}` : `Costas`}
                                                        prints={savedPrints.filter(p => !usedPrintIdsInCombo.has(p.id) || p.id === slot.printId)}
                                                        selectedPrintId={slot.printId}
                                                        onSelect={(printId) => handleUpdateSlotPrint(combo.id, slot.id, printId)}
                                                        onUpload={onUploadPrint}
                                                    />
                                                </div>
                                                <button onClick={() => handleDeleteSlotFromCombination(combo.id, slot.id)} className="p-2 self-end mb-2.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md hover:bg-red-500 hover:text-white" title="Remover Estampa"><MinusCircleIcon /></button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAddSlotToCombination(combo.id, 'front')} className="flex-1 flex items-center justify-center gap-1 text-sm bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 rounded-md py-2 hover:bg-cyan-600/40"><PlusCircleIcon /> Frente</button>
                                            <button onClick={() => handleAddSlotToCombination(combo.id, 'back')} disabled={!clothing.base64Back} className="flex-1 flex items-center justify-center gap-1 text-sm bg-violet-600/20 text-violet-700 dark:text-violet-300 rounded-md py-2 hover:bg-violet-600/40 disabled:bg-gray-600/20 disabled:text-gray-500 disabled:cursor-not-allowed"><PlusCircleIcon /> Costas</button>
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-7">
                                        <div className="grid grid-cols-2 gap-3">
                                            {combo.slots.map((slot, index) => {
                                                const print = savedPrints.find(p => p.id === slot.printId);
                                                const isBackSlot = slot.type === 'back';
                                                const canShowBackPreview = clothing.base64Back || !isBackSlot; // Only show back preview if back image exists or it's a front slot

                                                return (
                                                    <div key={slot.id} className="relative group aspect-square">
                                                        {canShowBackPreview ? (
                                                            <AssociationPreview 
                                                                clothing={clothing} 
                                                                print={print} 
                                                                side={slot.type} 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-sm text-gray-500">Sem costas</div>
                                                        )}
                                                        {print && canShowBackPreview && (
                                                            <button onClick={() => onPreviewDownload(clothing, print, slot.type)} className="absolute bottom-2 right-2 bg-gray-800/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-cyan-500" title={`Baixar prévia da ${slot.type === 'front' ? 'frente' : 'costas'}`}>
                                                                <DownloadIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={handleAddCombination} className="w-full bg-green-600/20 text-green-700 dark:text-green-300 font-semibold py-3 rounded-lg border-2 border-dashed border-green-600/30 hover:bg-green-600/40 transition-colors">
                        Adicionar Nova Combinação
                    </button>
                </div>
            )}
        </div>
    );
});


interface AssociationsPageProps {
    savedClothes: SavedClothing[];
    onUpdateClothing: (clothingId: string, updates: Partial<SavedClothing>) => Promise<void>;
    savedPrints: Print[];
    clothingCategories: string[];
    onBatchExport: () => void;
    onDeleteClothing: (clothingId: string) => void;
    onRenameClothing: (clothing: SavedClothing) => void;
    onUploadPrint: (files: FileList) => Promise<void>;
    onBatchGenerateMockups: () => void;
    isBatchGenerating: boolean;
}

export const AssociationsPage: React.FC<AssociationsPageProps> = ({
    savedClothes, onUpdateClothing, savedPrints, clothingCategories, 
    onBatchExport, onDeleteClothing, onRenameClothing, onUploadPrint,
    onBatchGenerateMockups, isBatchGenerating
}) => {
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [selectedPrintFilter, setSelectedPrintFilter] = useState<string | null>(null);

    const filteredClothes = useMemo(() => {
        return savedClothes.filter(clothing => {
            const categoryMatch = activeCategory === 'Todas' || clothing.category === activeCategory;
            if (!selectedPrintFilter) {
                return categoryMatch;
            }
            const printMatch = clothing.printCombinations.some(combo => 
                combo.slots.some(slot => slot.printId === selectedPrintFilter)
            );
            return categoryMatch && printMatch;
        });
    }, [savedClothes, activeCategory, selectedPrintFilter]);

    const handleExportCombination = useCallback(async (clothing: SavedClothing, combination: PrintCombination) => {
        const zip = new JSZip();
        const frontPrintForFolderName = savedPrints.find(p => p.id === combination.slots.find(s => s.type === 'front')?.printId);
        const folderName = (frontPrintForFolderName?.name || combination.name).replace(/\.[^/.]+$/, "").replace(/[\/\?<>\\:\*\|":]/g, '_');
        
        let frontCount = 0;
        for (const slot of combination.slots) {
            const print = savedPrints.find(p => p.id === slot.printId);
            if (!print) continue;

            const sideName = slot.type === 'front' ? `frente_var_${++frontCount}` : 'costas';
            const clothingNameSanitized = clothing.name.replace(/[\/\?<>\\:\*\|":]/g, '_');
            const baseClothing = slot.type === 'front' ? clothing.base64 : clothing.base64Back;
            const mimeType = slot.type === 'front' ? clothing.mimeType : clothing.mimeTypeBack;
            const width = slot.type === 'front' ? clothing.width : clothing.widthBack;
            const height = slot.type === 'front' ? clothing.height : clothing.heightBack;
            const mask = slot.type === 'front' ? clothing.mask : clothing.maskBack;

            if (!baseClothing || !mimeType || !width || !height) continue;

            const previewUrl = await createPrecompositeImage(`data:${mimeType};base64,${baseClothing}`, `data:${print.mimeType};base64,${print.base64}`, mask, { width, height }, 'original', null, 'Normal');
            if (previewUrl) {
                const jpgDataUrl = await pngDataUrlToJpgDataUrl(previewUrl);
                zip.file(`${clothingNameSanitized}_${sideName}.jpg`, jpgDataUrl.split(',')[1], { base64: true });
            }
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [savedPrints]);

    const handlePreviewDownload = useCallback(async (clothing: SavedClothing, print: Print | undefined, side: 'front' | 'back') => {
        if (!print) return;
        const base = side === 'front' ? clothing.base64 : clothing.base64Back;
        const mime = side === 'front' ? clothing.mimeType : clothing.mimeTypeBack;
        const w = side === 'front' ? clothing.width : clothing.widthBack;
        const h = side === 'front' ? clothing.height : clothing.heightBack;
        const mask = side === 'front' ? clothing.mask : clothing.maskBack;
        if (!base || !mime || !w || !h) return;

        const url = await createPrecompositeImage(`data:${mime};base64,${base}`, `data:${print.mimeType};base64,${print.base64}`, mask, { width: w, height: h }, 'original', null, 'Normal');
        if (url) {
            downloadDataUrlAsJpg(url, `${clothing.name}_${print.name.replace(/\.[^/.]+$/, "")}_${side}`);
        }
    }, []);

    return (
        <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><UsersIcon/> Associações</h1>
                <div className="flex items-center gap-4">
                    <button onClick={onBatchExport} className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-purple-500"><ZipIcon/> Exportar Pré-visualizações</button>
                     <button 
                        onClick={onBatchGenerateMockups} 
                        disabled={isBatchGenerating}
                        className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-green-500 disabled:bg-gray-500/80 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isBatchGenerating ? <LoadingSpinner/> : <MagicWandIcon />} 
                        {isBatchGenerating ? 'Gerando...' : 'Gerar Mockups Finais com IA'}
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Categoria:</label>
                    <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-md">
                        <button onClick={() => setActiveCategory('Todas')} className={`px-3 py-1 text-xs rounded ${activeCategory === 'Todas' ? 'bg-cyan-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>Todas</button>
                        {clothingCategories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-xs rounded ${activeCategory === cat ? 'bg-cyan-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>{cat}</button>)}
                    </div>
                </div>
                <div className="flex-grow">
                     <VisualPrintSelector 
                        title="Filtrar por Estampa:" 
                        prints={savedPrints} 
                        selectedPrintId={selectedPrintFilter}
                        onSelect={setSelectedPrintFilter}
                        onUpload={onUploadPrint}
                    />
                </div>
            </div>

            <div className="space-y-8">
                {filteredClothes.map(clothing => (
                    <ClothingAssociationCard
                        key={clothing.id} clothing={clothing} savedPrints={savedPrints}
                        onRenameClothing={onRenameClothing} 
                        onUpdateClothing={onUpdateClothing}
                        onDeleteClothing={onDeleteClothing} 
                        onExportCombination={handleExportCombination}
                        onPreviewDownload={handlePreviewDownload} onUploadPrint={onUploadPrint}
                    />
                ))}
                {filteredClothes.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <p className="text-lg text-gray-500">Nenhuma roupa encontrada para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
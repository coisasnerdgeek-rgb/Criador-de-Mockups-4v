import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Modal } from './Modal';
// FIX: Changed import to use types.ts
import { Mask, SavedMask } from '../types';
import { ResizeIcon, RotateIcon, CheckIcon, PencilIcon, TrashIcon, XIcon } from './Icons'; // Added XIcon

interface MaskCreatorProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onSave: (mask: Mask) => void;
  onCancel: () => void;
  initialMask?: Mask | null;
  saveButtonText?: string;
  savedMasks?: SavedMask[];
  onSaveCurrentMask?: (mask: Mask, name: string) => boolean;
  onDeleteSavedMask?: (id: string) => void;
  onUpdateSavedMask?: (id: string, newName: string) => boolean;
}

export const MaskCreator: React.FC<MaskCreatorProps> = ({ 
    imageUrl, 
    imageWidth, 
    imageHeight, 
    onSave, 
    onCancel, 
    initialMask, 
    saveButtonText, 
    savedMasks = [], 
    onSaveCurrentMask,
    onDeleteSavedMask,
    onUpdateSavedMask,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mask, setMask] = useState<Mask>({ x: 0, y: 0, width: 0, height: 0, rotation: 0, skewX: 0, skewY: 0 });
  
  const [newMaskName, setNewMaskName] = useState('');
  const [maskNameError, setMaskNameError] = useState<string | null>(null);

  const [editingMaskId, setEditingMaskId] = useState<string | null>(null);
  const [editingMaskName, setEditingMaskName] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isSkewingX, setIsSkewingX] = useState(false);
  const [isSkewingY, setIsSkewingY] = useState(false);
  const [skewStart, setSkewStart] = useState({ clientX: 0, clientY: 0, mask: mask });
  
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [resizeStart, setResizeStart] = useState({ clientX: 0, clientY: 0, mask: mask });
  const [rotationStart, setRotationStart] = useState({ mouseAngle: 0, maskRotation: 0 });
  const [containerSize, setContainerSize] = useState<{ width: number; height: number; } | null>(null);

  const containerStyle = {
    aspectRatio: `${imageWidth} / ${imageHeight}`,
  };
  
  useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new ResizeObserver(entries => {
          const entry = entries[0];
          if (entry) {
              const { width: cWidth, height: cHeight } = entry.contentRect;
              if (cWidth > 0 && cHeight > 0) {
                  setContainerSize({ width: cWidth, height: cHeight });
              }
          }
      });

      observer.observe(container);
      return () => observer.disconnect();
  }, []);

  useEffect(() => {
      if (containerSize) {
          const { width: cWidth, height: cHeight } = containerSize;
          if (initialMask) {
              setMask({
                  x: initialMask.x * cWidth,
                  y: initialMask.y * cHeight,
                  width: initialMask.width * cWidth,
                  height: initialMask.height * cHeight,
                  rotation: initialMask.rotation || 0,
                  skewX: initialMask.skewX || 0,
                  skewY: initialMask.skewY || 0,
              });
          } else {
              const defaultWidth = cWidth * 0.5;
              const defaultHeight = cWidth * 0.5; // keep it square by default
              setMask({
                  width: defaultWidth,
                  height: defaultHeight,
                  x: (cWidth - defaultWidth) / 2,
                  y: (cHeight - defaultHeight) / 2,
                  rotation: 0,
                  skewX: 0,
                  skewY: 0,
              });
          }
      }
  }, [containerSize, initialMask]);

  
  const getRelativeMask = useCallback((): Mask | null => {
     if (!containerRef.current || !containerSize) return null;
    const { width: containerWidth, height: containerHeight } = containerSize;
    if (containerWidth === 0 || containerHeight === 0) return null;

    return {
      x: mask.x / containerWidth,
      y: mask.y / containerHeight,
      width: mask.width / containerWidth,
      height: mask.height / containerHeight,
      rotation: mask.rotation,
      skewX: mask.skewX || 0,
      skewY: mask.skewY || 0,
    };
  }, [mask, containerSize]);

  const handleSave = () => {
    const relativeMask = getRelativeMask();
    if (relativeMask) {
        onSave(relativeMask);
    } else {
        console.error("Container has zero dimensions, cannot save mask.");
    }
  };
  
  const handleSaveCurrentMask = () => {
    setMaskNameError(null);
    if (onSaveCurrentMask && newMaskName.trim()) {
        const relativeMask = getRelativeMask();
        if (relativeMask) {
            const success = onSaveCurrentMask(relativeMask, newMaskName.trim());
            if (success) {
                setNewMaskName('');
            } else {
                setMaskNameError("Já existe uma máscara com este nome.");
            }
        }
    }
  };

  const handleSaveRename = () => {
    setRenameError(null);
    if (editingMaskId && onUpdateSavedMask) {
        const success = onUpdateSavedMask(editingMaskId, editingMaskName);
        if (success) {
            setEditingMaskId(null);
            setEditingMaskName('');
        } else {
            setRenameError("Já existe otra máscara com este nome.");
        }
    }
  };
  
  const handleApplySavedMask = useCallback((savedMask: Mask) => {
    if (!containerSize) return;
    const { width: cWidth, height: cHeight } = containerSize;

    setMask({
      x: savedMask.x * cWidth,
      y: savedMask.y * cHeight,
      width: savedMask.width * cWidth,
      height: savedMask.height * cHeight,
      rotation: savedMask.rotation || 0,
      skewX: savedMask.skewX || 0,
      skewY: savedMask.skewY || 0,
    });
  }, [containerSize]);

  const handleMouseDownOnMask = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    setIsDragging(true);

    const rad = -mask.rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const clickX = e.clientX - left - mask.x;
    const clickY = e.clientY - top - mask.y;
    const centerX = mask.width / 2;
    const centerY = mask.height / 2;

    const rotatedClickX = (clickX - centerX) * cos - (clickY - centerY) * sin + centerX;
    const rotatedClickY = (clickX - centerX) * sin + (clickY - centerY) * cos + centerY;
    
    setDragOffset({ x: rotatedClickX, y: rotatedClickY });
  };
  
  const handleMouseDownOnResizeHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ clientX: e.clientX, clientY: e.clientY, mask });
  };

  const handleMouseDownOnRotateHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();

    const centerX = mask.x + mask.width / 2;
    const centerY = mask.y + mask.height / 2;
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    const initialMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;

    setRotationStart({
        mouseAngle: initialMouseAngle,
        maskRotation: mask.rotation,
    });
    setIsRotating(true);
  };

   const handleMouseDownOnSkewXHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSkewingX(true);
    setSkewStart({ clientX: e.clientX, clientY: e.clientY, mask });
  };
  
  const handleMouseDownOnSkewYHandle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSkewingY(true);
    setSkewStart({ clientX: e.clientX, clientY: e.clientY, mask });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !containerSize || (!isDragging && !isResizing && !isRotating && !isSkewingX && !isSkewingY)) return;
    
    const { left, top } = containerRef.current.getBoundingClientRect();
    const { width: cWidth, height: cHeight } = containerSize;
    
    if (isDragging) {
      setMask(prevMask => {
          const mouseX = e.clientX - left;
          const mouseY = e.clientY - top;
          const newX = mouseX - dragOffset.x;
          const newY = mouseY - dragOffset.y;
          return {
              ...prevMask,
              x: Math.max(0, Math.min(newX, cWidth - prevMask.width)),
              y: Math.max(0, Math.min(newY, cHeight - prevMask.height)),
          }
      });

    } else if (isResizing) {
        const dx = e.clientX - resizeStart.clientX;
        const dy = e.clientY - resizeStart.clientY;
        
        setMask(prevMask => {
            const rad = prevMask.rotation * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            
            const dx_unrotated = dx * cos + dy * sin;
            const dy_unrotated = -dx * sin + dy * cos;

            const newWidth = resizeStart.mask.width + dx_unrotated;
            const newHeight = resizeStart.mask.height + dy_unrotated;

            const finalWidth = Math.max(20, newWidth);
            const finalHeight = Math.max(20, newHeight);

            const dw = finalWidth - resizeStart.mask.width;
            const dh = finalHeight - resizeStart.mask.height;
            
            const shiftX = (dw / 2) * cos - (dh / 2) * sin;
            const shiftY = (dw / 2) * sin + (dh / 2) * cos;
            
            const newX = resizeStart.mask.x - shiftX;
            const newY = resizeStart.mask.y - shiftY;

            return {
                ...prevMask,
                x: newX,
                y: newY,
                width: finalWidth,
                height: finalHeight,
            };
        });

    } else if (isRotating) {
        setMask(prevMask => {
            const centerX = prevMask.x + prevMask.width / 2;
            const centerY = prevMask.y + prevMask.height / 2;
            const mouseX = e.clientX - left;
            const mouseY = e.clientY - top;
            
            const currentMouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
            const angleDelta = currentMouseAngle - rotationStart.mouseAngle;
            
            let newRotation = rotationStart.maskRotation + angleDelta;
            
            return {...prevMask, rotation: newRotation};
        });
    } else if (isSkewingX || isSkewingY) {
        const dx = e.clientX - skewStart.clientX;
        const dy = e.clientY - skewStart.clientY;
        const rad = skewStart.mask.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const dx_unrotated = dx * cos + dy * sin;
        const dy_unrotated = -dx * sin + dy * cos;

        if (isSkewingX) { // Top handle, horizontal skew
            const oppositeLeg = skewStart.mask.height / 2;
            if (oppositeLeg === 0) return;
            const startOffset = Math.tan((skewStart.mask.skewX || 0) * Math.PI / 180) * oppositeLeg;
            const newOffset = startOffset + dx_unrotated;
            const newSkewX_rad = Math.atan2(newOffset, oppositeLeg);
            let newSkewX = newSkewX_rad * 180 / Math.PI;
            newSkewX = Math.max(-75, Math.min(75, newSkewX)); // Clamp angle
            setMask(prev => ({ ...prev, skewX: newSkewX }));
        } else { // isSkewingY, Left handle, vertical skew
            const oppositeLeg = skewStart.mask.width / 2;
            if (oppositeLeg === 0) return;
            const startOffset = Math.tan((skewStart.mask.skewY || 0) * Math.PI / 180) * oppositeLeg;
            const newOffset = startOffset + dy_unrotated;
            const newSkewY_rad = Math.atan2(newOffset, oppositeLeg);
            let newSkewY = newSkewY_rad * 180 / Math.PI;
            newSkewY = Math.max(-75, Math.min(75, newSkewY)); // Clamp angle
            setMask(prev => ({ ...prev, skewY: newSkewY }));
        }
    }
  }, [isDragging, isResizing, isRotating, isSkewingX, isSkewingY, dragOffset, resizeStart, rotationStart, containerSize, skewStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setIsSkewingX(false);
    setIsSkewingY(false);
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <Modal onClose={onCancel} title="Definir Área da Estampa">
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        
        {/* Left Column: Image Preview */}
        <div className="flex-grow flex flex-col" style={{ minWidth: 0 }}>
            <p className="text-gray-400 mb-4 text-center lg:text-left">
              Arraste para posicionar. Use as alças para redimensionar, rotacionar e inclinar.
            </p>

            <div 
                ref={containerRef}
                className="relative select-none w-full"
                style={{
                    ...containerStyle,
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                }}
            >
              <img src={imageUrl} alt="Roupa para mascarar" className="w-full h-full object-contain" draggable={false}/>
              
              <div
                className="absolute cursor-move border-2 border-dashed border-gray-500 rounded-lg bg-transparent"
                style={{
                  left: `${mask.x}px`,
                  top: `${mask.y}px`,
                  width: `${mask.width}px`,
                  height: `${mask.height}px`,
                  transform: `rotate(${mask.rotation}deg) skewX(${mask.skewX || 0}deg) skewY(${mask.skewY || 0}deg)`,
                  transformOrigin: 'center center',
                }}
                onMouseDown={handleMouseDownOnMask}
              >
                <div 
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full cursor-se-resize flex items-center justify-center"
                  onMouseDown={handleMouseDownOnResizeHandle}
                  aria-label="Resize handle"
                  role="button"
                >
                  <ResizeIcon />
                </div>
                <div 
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-5 h-5 bg-purple-500 rounded-full cursor-alias flex items-center justify-center"
                  onMouseDown={handleMouseDownOnRotateHandle}
                  aria-label="Rotate handle"
                  role="button"
                >
                  <RotateIcon />
                  {isRotating && (
                    <span className="absolute -top-6 bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                        {Math.round(mask.rotation)}°
                    </span>
                  )}
                </div>
                 <div 
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-yellow-400 rounded-full cursor-ew-resize flex items-center justify-center shadow"
                    onMouseDown={handleMouseDownOnSkewXHandle}
                    title="Inclinação Horizontal"
                    style={{ transform: `skewX(${-mask.skewX || 0}deg) skewY(${-mask.skewY || 0}deg)` }}
                />
                <div 
                    className="absolute top-1/2 -left-2 -translate-y-1/2 w-5 h-5 bg-yellow-400 rounded-full cursor-ns-resize flex items-center justify-center shadow"
                    onMouseDown={handleMouseDownOnSkewYHandle}
                    title="Inclinação Vertical"
                    style={{ transform: `skewX(${-mask.skewX || 0}deg) skewY(${-mask.skewY || 0}deg)` }}
                />
              </div>
            </div>
        </div>

        {/* Right Column: Controls */}
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col">
            <div className="space-y-6">
              <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Configurações da Máscara</h3>
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <label htmlFor="pos-x-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Posição X:</label>
                        <input id="pos-x-input-range" type="range" min="0" max={containerSize ? containerSize.width - mask.width : 0} step="1" value={mask.x} onChange={(e) => setMask(prev => ({ ...prev, x: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="relative w-28">
                          <input type="number" value={Math.round(mask.x)} onChange={(e) => setMask(prev => ({ ...prev, x: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-7 text-right" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">px</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="pos-y-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Posição Y:</label>
                        <input id="pos-y-input-range" type="range" min="0" max={containerSize ? containerSize.height - mask.height : 0} step="1" value={mask.y} onChange={(e) => setMask(prev => ({ ...prev, y: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="relative w-28">
                          <input type="number" value={Math.round(mask.y)} onChange={(e) => setMask(prev => ({ ...prev, y: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-7 text-right" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">px</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="width-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Largura:</label>
                        <input id="width-input-range" type="range" min="20" max={containerSize ? containerSize.width : 20} step="1" value={mask.width} onChange={(e) => setMask(prev => ({ ...prev, width: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="relative w-28">
                          <input type="number" value={Math.round(mask.width)} onChange={(e) => setMask(prev => ({ ...prev, width: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-7 text-right" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">px</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="height-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Altura:</label>
                        <input id="height-input-range" type="range" min="20" max={containerSize ? containerSize.height : 20} step="1" value={mask.height} onChange={(e) => setMask(prev => ({ ...prev, height: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <div className="relative w-28">
                          <input type="number" value={Math.round(mask.height)} onChange={(e) => setMask(prev => ({ ...prev, height: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-7 text-right" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">px</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label htmlFor="rotation-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Rotação:</label>
                       <input
                        id="rotation-input-range"
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={mask.rotation}
                        onChange={(e) => setMask(prev => ({ ...prev, rotation: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                       <div className="relative w-28">
                        <input
                            id="rotation-input-number"
                            type="number"
                            value={Math.round(mask.rotation)}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val)) setMask(prev => ({...prev, rotation: val % 360}));
                            }}
                            className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-6 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">°</span>
                      </div>
                    </div>

                     <div className="flex items-center gap-2">
                      <label htmlFor="skewx-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Inclinação X:</label>
                       <input id="skewx-input-range" type="range" min="-75" max="75" step="1" value={mask.skewX || 0} onChange={(e) => setMask(prev => ({ ...prev, skewX: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                       <div className="relative w-28">
                        <input type="number" value={Math.round(mask.skewX || 0)} onChange={(e) => setMask(prev => ({ ...prev, skewX: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-6 text-right" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">°</span>
                      </div>
                    </div>

                     <div className="flex items-center gap-2">
                      <label htmlFor="skewy-input-range" className="text-sm font-medium text-gray-300 w-20 flex-shrink-0">Inclinação Y:</label>
                       <input id="skewy-input-range" type="range" min="-75" max="75" step="1" value={mask.skewY || 0} onChange={(e) => setMask(prev => ({ ...prev, skewY: Number(e.target.value) }))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                       <div className="relative w-28">
                        <input type="number" value={Math.round(mask.skewY || 0)} onChange={(e) => setMask(prev => ({ ...prev, skewY: Number(e.target.value) }))} className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md p-1 w-full pr-6 text-right" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">°</span>
                      </div>
                    </div>

                  </div>
              </div>
              
              <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Máscaras Salvas</h3>
                  <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-2 rounded-lg border border-gray-700 space-y-1 mb-3">
                      {savedMasks.length > 0 ? (
                          savedMasks.map((sMask) => (
                             <div key={sMask.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors">
                                {editingMaskId === sMask.id ? (
                                    <div className="w-full">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editingMaskName}
                                                onChange={(e) => { setEditingMaskName(e.target.value); setRenameError(null); }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                                                className={`bg-gray-600 border text-white text-sm rounded-md p-1 w-full ${renameError ? 'border-red-500' : 'border-gray-500'}`}
                                                autoFocus
                                            />
                                            <div className="flex items-center">
                                                 <button onClick={handleSaveRename} className="text-green-400 hover:text-green-300 p-1"><CheckIcon className="h-5 w-5"/></button>
                                                <button onClick={() => {setEditingMaskId(null); setRenameError(null);}} className="text-red-400 hover:text-red-300 p-1">
                                                    <XIcon className="h-5 w-5" /> {/* Changed to XIcon */}
                                                </button>
                                            </div>
                                        </div>
                                        {renameError && <p className="text-red-400 text-xs">{renameError}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => handleApplySavedMask(sMask)} className="flex-grow text-left">
                                            <span className="text-gray-300 text-sm">{sMask.name}</span>
                                        </button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingMaskId(sMask.id); setEditingMaskName(sMask.name); setRenameError(null); }} className="p-1 text-gray-400 hover:text-white"><PencilIcon/></button>
                                            {onDeleteSavedMask && (
                                                <button onClick={() => onDeleteSavedMask(sMask.id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon/></button>
                                            )}
                                        </div>
                                    </>
                                )}
                             </div>
                          ))
                      ) : (
                          <p className="text-center text-gray-500 text-sm py-2">Nenhuma máscara salva.</p>
                      )}
                  </div>
                  {onSaveCurrentMask && (
                      <div className="space-y-2">
                         <input
                            type="text"
                            value={newMaskName}
                            onChange={(e) => { setNewMaskName(e.target.value); setMaskNameError(null); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentMask()}
                            placeholder="Nome para nova máscara"
                            className={`w-full bg-gray-700 border text-white rounded-md p-2 text-sm ${maskNameError ? 'border-red-500' : 'border-gray-600'}`}
                         />
                         {maskNameError && <p className="text-red-400 text-xs">{maskNameError}</p>}
                         <button onClick={handleSaveCurrentMask} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-purple-500">Salvar Máscara Atual</button>
                      </div>
                  )}
              </div>
            </div>
          
            <div className="flex justify-end gap-4 mt-auto pt-6 border-t border-gray-700">
                <button onClick={onCancel} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-500 transition-colors">Cancelar</button>
                <button onClick={handleSave} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-md hover:bg-cyan-500 transition-colors">{saveButtonText || 'Salvar e Continuar'}</button>
            </div>
        </div>
      </div>
    </Modal>
  );
};
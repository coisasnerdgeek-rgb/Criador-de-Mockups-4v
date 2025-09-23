
import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon, LoadingSpinner, RedoIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  title: string;
  previewUrl: string | null;
  disabled?: boolean;
  actionButton?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onClear?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  title, 
  previewUrl, 
  disabled = false, 
  actionButton,
  isLoading = false,
  error = null,
  onClear
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      onImageUpload(files[0]);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [disabled, onImageUpload]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };
  
  const triggerFileInput = () => {
      inputRef.current?.click();
  };

  const containerClasses = `relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 flex flex-col justify-center items-center h-24 ${
    disabled ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed' : 
    error ? 'border-red-500 bg-red-500/10 dark:bg-red-900/20' :
    isDragging ? 'border-cyan-400 bg-gray-200 dark:bg-gray-700' : 'border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 hover:border-cyan-500'
  }`;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{title}</h3>
      <div
        className={containerClasses}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled || isLoading}
        />
        {isLoading ? (
          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
            <LoadingSpinner />
            <p className="mt-2">Processando...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center text-red-500 dark:text-red-400 p-4">
            <p className="font-semibold">Erro ao carregar</p>
            <p className="text-sm mt-1 text-center">{error}</p>
            <button onClick={triggerFileInput} className="mt-4 bg-cyan-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-cyan-500 transition-colors">
                Tentar Novamente
            </button>
          </div>
        ) : previewUrl ? (
          <div className="w-full h-full relative group bg-black/20 rounded-md">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <button onClick={triggerFileInput} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    <RedoIcon /> Trocar
                </button>
                {onClear && (
                    <button onClick={onClear} className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-500 transition-all" title="Remover Estampa">
                        <TrashIcon />
                    </button>
                )}
            </div>
            {actionButton}
          </div>
        ) : (
          <button type="button" onClick={triggerFileInput} className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400" disabled={disabled}>
            <UploadIcon />
            <p className="mt-2">Arraste e solte ou <span className="font-semibold text-cyan-500 dark:text-cyan-400">clique para carregar</span></p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP (Max 15MB)</p>
          </button>
        )}
      </div>
    </div>
  );
};

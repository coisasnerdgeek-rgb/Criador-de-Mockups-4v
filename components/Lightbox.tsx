import React, { useEffect } from 'react';
import { downloadDataUrlAsJpg } from '../utils/fileUtils';
import { DownloadIcon, XIcon } from './Icons'; // Added XIcon
import { ZoomableImage } from './ZoomableImage';

export const Lightbox: React.FC<{ src: string; onClose: () => void; }> = ({ src, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        downloadDataUrlAsJpg(src, `imagem-${new Date().getTime()}`);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full h-full p-8 sm:p-12 md:p-16"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
            >
                <ZoomableImage src={src} alt="Imagem ampliada" className="w-full h-full object-contain" controlsVisible />
            </div>
             <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50 p-2 bg-black/30 rounded-full"
                aria-label="Fechar"
            >
                <XIcon className="h-6 w-6" /> {/* Changed to XIcon */}
            </button>
            <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 text-white/70 hover:text-white transition-colors z-50 p-2 bg-black/30 rounded-full flex items-center gap-2"
                aria-label="Baixar Imagem"
            >
                <DownloadIcon />
            </button>
        </div>
    );
};
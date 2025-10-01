import React from 'react';
import JSZip from 'jszip';
import { JpgIcon, PngIcon, RedoIcon, ZipIcon, LoadingSpinner } from './Icons';
import { ZoomableImage } from '@/components/ZoomableImage';


interface ResultDisplayProps {
  imageUrls: string[];
  onReset: () => void;
  clothingName?: string;
  printNameFront?: string;
  printNameBack?: string;
  generationMode?: 'front' | 'back' | 'both';
  generationType?: 'standard' | 'poses-3' | 'models';
  isZipping: boolean; // Added prop
  setIsZipping: React.Dispatch<React.SetStateAction<boolean>>; // Added prop
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrls, onReset, clothingName, printNameFront, printNameBack, generationMode, generationType, isZipping, setIsZipping }) => {
  // Removed local state: const [isZipping, setIsZipping] = useState(false);

  const getFilename = (index: number, extension: 'png' | 'jpg'): string => {
    const cName = (clothingName || 'mockup').replace(/[\/\?<>\\:\*\|":]/g, '_');
    
    if (generationType !== 'standard') {
        const pName = (printNameFront || 'estampa').replace(/[\/\?<>\\:\*\|":]/g, '_').replace(/\.[^/.]+$/, "");
        return `${cName}-${pName}-pose-${index + 1}.${extension}`;
    }

    let side = '';
    let pName = '';
    
    if (imageUrls.length === 1) { // Single generation (front or back)
        if (generationMode === 'back') {
            side = 'costas';
            pName = (printNameBack || 'estampa').replace(/[\/\?<>\\:\*\|":]/g, '_');
        } else { // 'front' or 'both' but only one result (e.g. back failed)
            side = 'frente';
            pName = (printNameFront || 'estampa').replace(/[\/\?<>\\:\*\|":]/g, '_');
        }
    } else { // Both front and back
        if (index === 0) {
            side = 'frente';
            pName = (printNameFront || 'estampa').replace(/[\/\?<>\\:\*\|":]/g, '_');
        } else {
            side = 'costas';
            pName = (printNameBack || 'estampa').replace(/[\/\?<>\\:\*\|":]/g, '_');
        }
    }

    pName = pName.replace(/\.[^/.]+$/, ""); // remove extension from print name
    return `${cName}-${side}-${pName}.${extension}`;
  };


  const handleJpgDownload = (imageUrl: string, filename: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = jpgDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.src = imageUrl;
  };
  
  const handleDownloadAllAsZip = async () => {
    if (!imageUrls.length) return;
    setIsZipping(true);
    try {
        const zipFilename = `${clothingName || 'ai-mockup'}.zip`;
        const zip = new JSZip();

        imageUrls.forEach((url, index) => {
            const filename = getFilename(index, 'png');
            const base64Data = url.substring(url.indexOf(',') + 1);
            zip.file(filename, base64Data, { base64: true });
        });

        const content = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Falha ao criar o arquivo ZIP", error);
    } finally {
        setIsZipping(false);
    }
  };

  const getTitle = (index: number) => {
    if (imageUrls.length === 2) {
        return index === 0 ? "Frente" : "Costas";
    }
    if (imageUrls.length > 1) {
        return `Resultado ${index + 1}`;
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Seu Mockup está Pronto!</h2>
      <div className={`w-full max-w-5xl grid grid-cols-1 ${imageUrls.length > 1 ? 'md:grid-cols-2' : ''} ${imageUrls.length > 2 ? 'lg:grid-cols-3' : ''} gap-6`}>
        {imageUrls.map((imageUrl, index) => {
          const pngFilename = getFilename(index, 'png');
          const jpgFilename = getFilename(index, 'jpg');
          const title = getTitle(index);

          return (
            <div key={index} className="flex flex-col gap-2">
              {title && <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>}
              <div className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-2 border border-gray-200 dark:border-gray-700 aspect-square">
                <ZoomableImage src={imageUrl} alt={`Generated mockup ${index + 1}`} />
                <div
                  className="absolute bottom-4 right-4 z-10 flex gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <a
                    href={imageUrl}
                    download={pngFilename}
                    className="bg-green-600 text-white font-bold p-3 rounded-full shadow-lg hover:bg-green-500 transform hover:scale-110"
                    title="Baixar como PNG"
                    aria-label={`Download mockup ${index + 1} as PNG`}
                  >
                    <PngIcon />
                  </a>
                  <button
                    onClick={() => handleJpgDownload(imageUrl, jpgFilename)}
                    className="bg-blue-600 text-white font-bold p-3 rounded-full shadow-lg hover:bg-blue-500 transform hover:scale-110"
                    title="Baixar como JPG"
                    aria-label={`Download mockup ${index + 1} as JPG`}
                  >
                    <JpgIcon />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="bg-gray-500 dark:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <RedoIcon />
          Gerar Novamente
        </button>
        {imageUrls.length > 1 && (
          <button
            onClick={handleDownloadAllAsZip}
            disabled={isZipping}
            className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-500 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isZipping ? <LoadingSpinner /> : <ZipIcon />}
            {isZipping ? 'Compactando...' : 'Baixar Todas (ZIP)'}
          </button>
        )}
      </div>
    </div>
  );
};
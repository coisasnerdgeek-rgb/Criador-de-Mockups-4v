// FIX: Changed import to use types.ts
import { Mask } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Falha ao converter o arquivo para base64."));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
    });
};

export const urlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Falha ao buscar a imagem: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Erro em urlToBase64:", error);
        throw new Error("Não foi possível carregar a imagem da URL. Verifique o link e as permissões de CORS.");
    }
};


export const base64ToFile = async (base64: string, filename: string, mimeType: string = 'image/png'): Promise<File> => {
    const res = await fetch(`data:${mimeType};base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
};

// FIX: complete function body and add return statement
export const blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, { lastModified: new Date().getTime(), type: theBlob.type });
};


// FIX: Add missing function getImageDimensions
export const getImageDimensions = (file: File | Blob): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = (err) => {
            reject(err);
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    });
};

// FIX: Add missing function getImageDimensionsFromUrl
export const getImageDimensionsFromUrl = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = (err) => {
            reject(new Error(`Failed to load image from url: ${url}`));
        };
        img.src = url;
    });
};

// FIX: Add missing function processAndValidateImageFile
export const processAndValidateImageFile = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const MAX_SIZE_MB = 15;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            return reject(new Error(`Tipo de arquivo inválido. Apenas ${ALLOWED_TYPES.join(', ')} são permitidos.`));
        }

        if (file.size > MAX_SIZE_BYTES) {
            return reject(new Error(`A imagem é muito grande. O tamanho máximo é de ${MAX_SIZE_MB}MB.`));
        }
        resolve(file);
    });
};

// FIX: Add missing function pngDataUrlToJpgDataUrl
export const pngDataUrlToJpgDataUrl = (dataUrl: string, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            return reject(new Error("Invalid data URL provided."));
        }
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(jpgDataUrl);
            } else {
                reject(new Error("Could not get 2d canvas context."));
            }
        };
        img.onerror = () => {
            reject(new Error("Failed to load image from data URL."));
        };
        img.src = dataUrl;
    });
};

// FIX: Add missing function downloadDataUrlAsJpg
export const downloadDataUrlAsJpg = async (dataUrl: string, filename: string, quality: number = 0.95): Promise<void> => {
    const jpgDataUrl = dataUrl.startsWith('data:image/jpeg') 
        ? dataUrl 
        : await pngDataUrlToJpgDataUrl(dataUrl, quality);

    const link = document.createElement('a');
    link.href = jpgDataUrl;
    link.download = `${filename}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// FIX: Add missing function createPrecompositeImage
export const createPrecompositeImage = (
    clothingDataUrl: string,
    printDataUrl: string | null,
    mask: Mask | null,
    clothingDimensions: { width: number; height: number },
    aspectRatio: string,
    color: string | null,
    blendMode: string
): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        if (!clothingDataUrl) {
            return resolve(null);
        }

        const clothingImg = new Image();
        clothingImg.crossOrigin = 'anonymous';

        clothingImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Could not get canvas context."));

            let canvasWidth = clothingImg.naturalWidth;
            let canvasHeight = clothingImg.naturalHeight;
            const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
            
            if (ratioW && ratioH && aspectRatio !== 'original') {
                const imgRatio = clothingImg.naturalWidth / clothingImg.naturalHeight;
                const canvasRatio = ratioW / ratioH;
                if (imgRatio > canvasRatio) { 
                    canvasHeight = clothingImg.naturalWidth / canvasRatio;
                } else { 
                    canvasWidth = clothingImg.naturalHeight * canvasRatio;
                }
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const drawX = (canvas.width - clothingImg.naturalWidth) / 2;
            const drawY = (canvas.height - clothingImg.naturalHeight) / 2;

            if (color) {
                // Create a temporary canvas for the colorized version
                const colorCanvas = document.createElement('canvas');
                colorCanvas.width = clothingImg.naturalWidth;
                colorCanvas.height = clothingImg.naturalHeight;
                const colorCtx = colorCanvas.getContext('2d');

                if (colorCtx) {
                    // Step 1: Draw the original image to use as a mask and for luminosity
                    colorCtx.drawImage(clothingImg, 0, 0);

                    // Step 2: Fill a rectangle with the target color. Using 'source-in' will apply this color
                    // only where the original image had pixels, effectively creating a solid color silhouette.
                    colorCtx.globalCompositeOperation = 'source-in';
                    colorCtx.fillStyle = color;
                    colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
                    
                    // Step 3: Now, draw the original image again, but this time using the 'luminosity'
                    // blend mode. This takes the lightness/darkness from the original image and applies it
                    // to the solid color shape we just created, restoring shading and texture details.
                    colorCtx.globalCompositeOperation = 'luminosity';
                    colorCtx.drawImage(clothingImg, 0, 0);
                    
                    // Step 4: Draw the final colorized and shaded image onto the main canvas.
                    ctx.drawImage(colorCanvas, drawX, drawY);
                } else {
                     ctx.drawImage(clothingImg, drawX, drawY); // fallback
                }
            } else {
                ctx.drawImage(clothingImg, drawX, drawY);
            }

            if (!printDataUrl || !mask) {
                return resolve(canvas.toDataURL('image/png'));
            }

            const printImg = new Image();
            printImg.crossOrigin = 'anonymous';
            printImg.onload = () => {
                const maskX = mask.x * clothingDimensions.width + drawX;
                const maskY = mask.y * clothingDimensions.height + drawY;
                const maskWidth = mask.width * clothingDimensions.width;
                const maskHeight = mask.height * clothingDimensions.height;

                ctx.save();
                
                // Translate context to the mask's position and orientation
                ctx.translate(maskX + maskWidth / 2, maskY + maskHeight / 2);
                ctx.rotate(mask.rotation * Math.PI / 180);

                // Apply skew transformation for perspective
                const skewX_rad = (mask.skewX || 0) * Math.PI / 180;
                const skewY_rad = (mask.skewY || 0) * Math.PI / 180;
                // The canvas transform(a, b, c, d, e, f) uses b for vertical skew (skewY) and c for horizontal skew (skewX).
                ctx.transform(1, Math.tan(skewY_rad), Math.tan(skewX_rad), 1, 0, 0);


                // Create a clipping path for the mask area to prevent overflow
                ctx.beginPath();
                ctx.rect(-maskWidth / 2, -maskHeight / 2, maskWidth, maskHeight);
                ctx.clip();

                // Set blend mode
                ctx.globalCompositeOperation = blendMode.toLowerCase() === 'normal' ? 'source-over' : blendMode.toLowerCase() as GlobalCompositeOperation;

                // Calculate "contain" dimensions for the print to fit inside the mask
                const scale = Math.min(maskWidth / printImg.naturalWidth, maskHeight / printImg.naturalHeight);
                const targetWidth = printImg.naturalWidth * scale;
                const targetHeight = printImg.naturalHeight * scale;

                // Calculate position to align top-center within the mask area
                const drawPrintX = -targetWidth / 2; // Horizontally centered
                const drawPrintY = -maskHeight / 2; // Aligned to the top

                ctx.drawImage(
                    printImg,
                    drawPrintX,
                    drawPrintY,
                    targetWidth,
                    targetHeight
                );

                ctx.restore();
                resolve(canvas.toDataURL('image/png'));
            };
            printImg.onerror = (e) => reject(new Error("Failed to load print image."));
            printImg.src = printDataUrl;
        };

        clothingImg.onerror = (e) => reject(new Error("Failed to load clothing image."));
        clothingImg.src = clothingDataUrl;
    });
};
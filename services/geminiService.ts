// FIX: Corrected import to use GoogleGenAI instead of deprecated GoogleGenerativeAI
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { MockupPrompts, ColorPalette } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

// FIX: Corrected GoogleGenAI initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// Helper function to extract image data from response
const getGeneratedImage = (response: GenerateContentResponse): string => {
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error("Nenhuma imagem foi gerada pelo modelo. A resposta pode ter sido bloqueada por segurança.");
};

// FIX: Added missing function generateMockup.
export const generateMockup = async (
    mockupPrompts: MockupPrompts,
    imageBase64: string,
    imageMimeType: string,
    posePrompt: string | undefined,
    color: string | null,
    backgroundInstruction: string,
    referenceImageB64?: string,
    referenceImageMime?: string,
    customBgData?: { base64: string; mimeType: string },
    isBackViewWithoutRef?: boolean,
    hasPrint?: boolean
): Promise<string> => {
    const mainImagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };
    const parts: any[] = [];
    let promptText: string;
    const colorText = color ? mockupPrompts.colorInstruction.replace('{color}', color) : mockupPrompts.noColorInstruction;

    if (referenceImageB64 && referenceImageMime) {
        parts.push({ inlineData: { data: referenceImageB64, mimeType: referenceImageMime } });
        parts.push(mainImagePart);
        promptText = mockupPrompts.backWithReferencePrompt
            .replace('{backgroundInstruction}', `\n- INSTRUÇÃO DE FUNDO: ${backgroundInstruction}`)
            .replace('{colorInstruction}', colorText);
    } else {
        parts.push(mainImagePart);
        promptText = hasPrint ? mockupPrompts.basePrompt : mockupPrompts.basePromptNoPrint;
        
        if (posePrompt) {
            promptText += mockupPrompts.poseVariationPrompt
                .replace('{promptVariation}', `\n- POSE: ${posePrompt}`)
                .replace('{colorInstruction}', colorText);
        } else {
            if (isBackViewWithoutRef) {
                promptText += mockupPrompts.standardBackViewPrompt.replace('{colorInstruction}', colorText);
            } else {
                promptText += mockupPrompts.standardFrontViewPrompt.replace('{colorInstruction}', colorText);
            }
        }
        promptText += `\n- INSTRUÇÃO DE FUNDO: ${backgroundInstruction}`;
    }

    parts.push({ text: promptText });
    if (customBgData) {
        parts.push({ inlineData: { data: customBgData.base64, mimeType: customBgData.mimeType } });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return getGeneratedImage(response);
};

// FIX: Added missing function removeBackground.
export const removeBackground = async (imageBase64: string, imageMimeType: string): Promise<string> => {
    const imagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };
    const textPart = { text: "Remova completamente o fundo da imagem, deixando-o 100% transparente com um canal alfa. O resultado deve ser um arquivo PNG." };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return getGeneratedImage(response);
};

// FIX: Added missing function generateImageWithBackground.
export const generateImageWithBackground = async (
    imageBase64: string,
    imageMimeType: string,
    backgroundPrompt: string
): Promise<string> => {
    const imagePart = { inlineData: { data: imageBase64, mimeType: imageMimeType } };
    const textPart = { text: `Adicione o seguinte fundo à imagem: ${backgroundPrompt}` };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return getGeneratedImage(response);
};

// FIX: Added missing function editImage.
export const editImage = async (
    mainImage: { base64: string; mimeType: string },
    additionalImages: { base64: string; mimeType: string }[],
    prompt: string,
    draftImage?: { base64: string; mimeType: string }
): Promise<string> => {
    const parts: any[] = [];
    parts.push({ inlineData: { data: mainImage.base64, mimeType: mainImage.mimeType } });

    let finalPrompt = prompt;

    if (draftImage) {
        parts.push({ inlineData: { data: draftImage.base64, mimeType: draftImage.mimeType } });
        finalPrompt = `INSTRUÇÃO CRÍTICA: Use o seguinte rascunho como um guia visual para a composição e posicionamento dos elementos. O rascunho indica o layout desejado. Ignore as cores do rascunho e foque apenas na estrutura. O prompt de texto do usuário é: "${prompt}"`;
    }

    additionalImages.forEach(img => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
    });
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    return getGeneratedImage(response);
};

export const suggestColorPalettes = async (printBase64: string): Promise<ColorPalette[]> => {
    const imagePart = { inlineData: { data: printBase64, mimeType: "image/png" } };
    const textPart = { text: "Analise a imagem de estampa fornecida. Sugira 3 paletas de cores harmoniosas para o tecido de uma peça de roupa que usaria esta estampa. Cada paleta deve ter um nome criativo e conter exatamente 5 cores em formato hexadecimal." };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        paletteName: { 
                            type: Type.STRING,
                            description: 'Um nome criativo e temático para a paleta de cores (ex: "Entardecer Tropical").'
                        },
                        colors: {
                            type: Type.ARRAY,
                            description: 'Uma lista de exatamente 5 códigos de cores hexadecimais (ex: "#FFFFFF") que compõem a paleta.',
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                }
            }
        },
    });

    try {
        const jsonText = response.text.trim();
        const palettes = JSON.parse(jsonText);
        // Basic validation
        if (Array.isArray(palettes) && palettes.every(p => p.paletteName && Array.isArray(p.colors))) {
            return palettes;
        }
        throw new Error("Formato de resposta da paleta de cores inválido.");
    } catch (e) {
        console.error("Falha ao analisar a resposta da paleta de cores:", e);
        throw new Error("Não foi possível obter sugestões de cores da IA.");
    }
};
import { SavedImagePrompt, PromptSettings, Pose, MockupPrompts, InspirationItem } from './types';

export const initialClothingCategories = ['Camiseta', 'Polo', 'Mullet', 'Moletom', 'Infantil', 'Regata', 'Ecobag'];

export const loadingMessages = [
    'Preparando imagem base...',
    'Aplicando estampa no tecido...',
    'Ajustando dobras e sombras realistas...',
    'Gerando modelo fotorrealista...',
    'Renderizando imagem em alta qualidade...',
    'Finalizando os detalhes...'
];

export const initialBackgroundPrompts: { [key: string]: string } = {
    'Sem Fundo': 'Fundo 100% transparente (canal alfa). Se não for possível, use um fundo de cor sólida cinza claro neutro (#DDDDDD) para facilitar a remoção posterior. O foco é apenas na roupa.',
    'Estúdio Profissional': 'Fundo de estúdio fotográfico profissional, cor sólida cinza claro (#E0E0E0), com iluminação suave e difusa. O ambiente deve ser limpo, minimalista e sem distrações.',
    'Urbano Moderno': 'Ambiente urbano de uma cidade moderna. Uma rua limpa com arquitetura contemporânea ou uma parede de concreto texturizada. O fundo deve estar levemente desfocado para dar destaque ao modelo.',
    'Parque Natural': 'Cenário natural ao ar livre, como um parque bem cuidado com árvores verdes e luz do sol filtrada. O ambiente deve transmitir uma sensação de calma e frescor.',
    'Interior de Loja': 'Interior de uma loja de roupas de luxo, minimalista e bem iluminada. Pode incluir araras de roupas ou prateleiras elegantemente desfocadas ao fundo.',
    'Praia Tropical': 'Praia tropical com areia clara e mar azul-turquesa. O sol deve estar brilhante, criando uma atmosfera de verão. O modelo deve estar integrado de forma natural na cena.',
    'Loft Industrial': 'Fundo de tijolos brancos ou cinza claro, estilo loft industrial. O ambiente deve ser espaçoso, com grandes janelas que fornecem luz natural.',
};

export const initialPosePrompts: Record<Pose, string> = {
    'Frente': 'Modelo de frente, corpo inteiro, olhando para a câmera, pose de catálogo padrão.',
    'Meio de lado': 'Modelo em vista 3/4 (meio de lado), corpo inteiro, pose natural e casual.',
    'De lado': 'Modelo de perfil (de lado), corpo inteiro, em uma pose fashion, mostrando o caimento lateral da roupa.',
    'Costas': 'Modelo de costas, corpo inteiro, mostrando a parte de trás da roupa.'
};

export const defaultMockupPrompts: MockupPrompts = {
    basePrompt: `Assuma o papel de um fotógrafo de moda de elite. Sua tarefa é criar um mockup com qualidade de editorial de luxo, ultra-realista e cinematográfico. Coloque a peça de roupa da imagem de entrada em um modelo humano, usando iluminação de estúdio profissional para criar uma imagem de altíssima definição.
- O estilo geral deve ser sofisticado, limpo e com a qualidade de uma campanha de moda de alta-costura.
- CONSISTÊNCIA DO MODELO: Se estiver gerando múltiplas imagens, o modelo (rosto, cabelo, tipo de corpo, tom de pele) DEVE ser 100% consistente em todas as fotos.
- DISTORÇÃO E REALISMO DA ESTAMPA (REQUISITO MÁXIMO): A estampa deve se fundir com o tecido. Ela precisa ser distorcida de forma realista para seguir CADA dobra, ondulação, sombra e contorno da roupa. A iluminação sobre a estampa deve corresponder perfeitamente à iluminação sobre o tecido. A textura do tecido deve ser visível através da estampa.
- FIDELIDADE DA ESTAMPA (REQUISITO INVIOLÁVEL): A estampa (tamanho, posição, rotação, proporção) na roupa de entrada é EXATA e pré-definida. Sua tarefa é renderizá-la no modelo sem NENHUMA alteração em sua geometria. NÃO redimensione, NÃO mova, NÃO rotacione, NÃO recorte a estampa. Replique-a com 100% de fidelidade. O seu único trabalho é aplicar a distorção do tecido sobre a estampa (seguindo dobras, sombras e contornos), mas a posição e tamanho GERAL da estampa na peça NÃO DEVE MUDAR.
- O resultado deve ser uma foto de corpo inteiro ou da cintura para cima do modelo.`,
    basePromptNoPrint: `Assuma o papel de um fotógrafo de moda de elite. Sua tarefa é criar um mockup com qualidade de editorial de luxo, ultra-realista e cinematográfico. Coloque a peça de roupa da imagem de entrada em um modelo humano, usando iluminação de estúdio profissional para criar uma imagem de altíssima definição.
- O estilo geral deve ser sofisticado, limpo e com a qualidade de uma campanha de moda de alta-costura.
- CONSISTÊNCIA DO MODELO: Se estiver gerando múltiplas imagens, o modelo (rosto, cabelo, tipo de corpo, tom de pele) DEVE ser 100% consistente em todas as fotos.
- FIDELIDADE DA ROUPA (REQUISITO MÁXIMO): A roupa na imagem de entrada é EXATA. Sua tarefa é renderizá-la no modelo sem NENHUMA alteração em sua geometria, corte, caimento ou textura. A roupa deve ser renderizada SEM NENHUMA ESTAMPA OU LOGO. Replique o tecido liso com 100% de fidelidade. O seu único trabalho é vestir o modelo com esta peça de roupa.
- O resultado deve ser uma foto de corpo inteiro ou da cintura para cima do modelo.`,
    backWithReferencePrompt: `Esta é a IMAGEM DE REFERÊNCIA. Ela mostra um modelo vestindo uma peça de roupa de frente. A seguir, está a IMAGEM DE ENTRADA, a mesma peça de roupa, mas com a estampa das costas.
SUA TAREFA: Crie uma imagem fotorrealista mostrando o mesmo modelo da IMAGEM DE REFERÊNCIA, na mesma pose, com a mesma iluminação e no mesmo ambiente, mas visto por trás para mostrar a estampa das costas da IMAGEM DE ENTRADA.
REQUISITO CRÍTICO DE CONSISTÊNCIA: A consistência do modelo (rosto, cabelo, tipo de corpo) e do ambiente entre a IMAGEM DE REFERÊNCIA e a sua imagem de saída é o requisito mais importante. NÃO mude o modelo. NÃO mude a pose. Apenas mude o ângulo da câmera para as costas, mantendo todo o resto idêntico.
REQUISITO CRÍTICO DE ROUPA: A forma, o corte, o tecido e o caimento da roupa na imagem de saída DEVEM ser 100% fiéis à IMAGEM DE ENTRADA (VISTA TRASEIRA). NÃO copie NENHUMA característica da roupa da IMAGEM DE REFERÊNCIA (VISTA FRONTAL).
- FIDELIDADE DA ESTAMPA (REQUISITO INVIOLÁVEL): A estampa das costas (tamanho, posição, etc.) é EXATA. NÃO a altere. Apenas aplique a distorção do tecido sobre ela, seguindo dobras e sombras de forma realista, assim como na vista frontal.
{backgroundInstruction}
{colorInstruction}`,
    poseVariationPrompt: `- CONSISTÊNCIA DO MODELO (REQUISITO CRÍTICO): Para VARIAÇÃO DE POSES, mantenha a APARÊNCIA DO MODELO (rosto, cabelo, tipo de corpo, tom de pele) 100% consistente entre as imagens.\n- INSTRUÇÃO DE POSE: {promptVariation}{colorInstruction}`,
    standardFrontViewPrompt: `- INSTRUÇÃO CRÍTICA PARA ESTE MODO: FIDELIDADE MÁXIMA. Sua principal tarefa é colocar a peça de roupa da imagem de entrada em um modelo humano de forma fotorrealista, preservando suas características.\n- O modelo deve ser mostrado de frente, em uma pose de catálogo padrão.{colorInstruction}`,
    standardBackViewPrompt: `- INSTRUÇÃO CRÍTICA PARA ESTE MODO: FIDELIDADE MÁXIMA. Sua principal tarefa é colocar a peça de roupa da imagem de entrada em um modelo humano de forma fotorrealista, preservando suas características.\n- A imagem de entrada mostra a VISTA TRASEIRA (COSTAS) da roupa. O modelo deve ser mostrado de costas.{colorInstruction}`,
    colorInstruction: `\n- MUDANÇA DE COR PRECISA: A ÚNICA alteração permitida na roupa é a cor base do tecido. Ignore a cor original e renderize o tecido com a cor hexadecimal EXATA {color}. NÃO varie o tom. AS CORES DA ESTAMPA, a cor da pele do modelo, do cabelo e do fundo NÃO DEVEM ser afetadas. TODAS as outras características (corte, formato, textura, caimento) DEVEM ser preservadas com 100% de fidelidade à imagem de entrada.`,
    noColorInstruction: `\n- FIDELIDADE ABSOLUTA: A peça de roupa na imagem de saída deve ser 100% IDÊNTICA à da imagem de entrada. NÃO altere o corte, tecido, forma ou cor. Preserve todas as características originais com precisão absoluta.`,
};

export const defaultPromptSettings: PromptSettings = {
    mockup: defaultMockupPrompts,
    backgrounds: initialBackgroundPrompts,
    poses: initialPosePrompts,
};

export const initialImagePrompts: SavedImagePrompt[] = [
    { id: crypto.randomUUID(), name: "Remover Fundo", prompt: "Remova completamente o fundo da imagem, deixando-o 100% transparente com um canal alfa. O resultado deve ser um arquivo PNG." },
    { id: crypto.randomUUID(), name: "Melhorar Definição", prompt: "Melhore a definição geral da imagem. Faça um upscale para uma resolução maior, deixe os elementos mais nítidos e melhore a legibilidade de qualquer texto ou fonte, mas sem perder a consistência e a forma da logo ou dos elementos principais." },
    { id: crypto.randomUUID(), name: "Poses Diferentes", prompt: "Gere 3 imagens com o item principal em poses e ângulos ligeiramente diferentes. Mantenha o mesmo estilo e características do original." },
    { id: crypto.randomUUID(), name: "Estilo Studio Ghibli", prompt: "Redesenhe a imagem no estilo de arte icônico do Studio Ghibli, com cores pastéis, contornos suaves e um toque de fantasia." },
    { id: crypto.randomUUID(), name: "Mudar Cor", prompt: "Mude a cor principal do objeto na imagem para [INSIRA A COR AQUI], mantendo o realismo da imagem. Preserve as dobras naturais, sombras e a textura original." },
];

export const inspirationItems: InspirationItem[] = [
    {
        id: 'insp-1',
        name: 'Estúdio Minimalista',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/minimalist-studio.webp',
        settings: {
            generationType: 'standard',
            generationAspectRatio: '3:4',
            generationMode: 'front',
            selectedColor: null,
            blendMode: 'Normal',
            backgroundTheme: 'Estúdio Profissional',
            selectedPoses: [],
            modelFilter: { gender: 'Feminino', age: 'Jovem (18-25)', ethnicity: 'Caucasiana' },
        }
    },
    {
        id: 'insp-2',
        name: 'Vibração Urbana',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/urban-vibe.webp',
        settings: {
            generationType: 'models',
            generationAspectRatio: '1:1',
            generationMode: 'front',
            selectedColor: '#1F2937', // Dark Gray
            blendMode: 'Normal',
            backgroundTheme: 'Urbano Moderno',
            selectedPoses: [],
            modelFilter: { gender: 'Masculino', age: 'Jovem (18-25)', ethnicity: 'Negra' },
        }
    },
    {
        id: 'insp-3',
        name: 'Luz Natural no Parque',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/park-light.webp',
        settings: {
            generationType: 'poses-3',
            generationAspectRatio: '4:3',
            generationMode: 'front',
            selectedColor: '#FFFFFF',
            blendMode: 'Overlay',
            backgroundTheme: 'Parque Natural',
            selectedPoses: ['Frente', 'Meio de lado'],
            modelFilter: { gender: 'Feminino', age: 'Jovem (18-25)', ethnicity: 'Asiática' },
        }
    },
    {
        id: 'insp-4',
        name: 'Look de Verão',
        imageUrl: 'https://storage.googleapis.com/aistudio-hosting/templates/summer-look.webp',
        settings: {
            generationType: 'standard',
            generationAspectRatio: '9:16',
            generationMode: 'front',
            selectedColor: '#FDE68A', // Light Yellow
            blendMode: 'Multiply',
            backgroundTheme: 'Praia Tropical',
            selectedPoses: [],
            modelFilter: { gender: 'Feminino', age: 'Jovem (18-25)', ethnicity: 'Hispânica' },
        }
    },
];
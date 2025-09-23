import React, { useState, useEffect, useRef } from 'react';
import { PromptSettings, ImportStatus, Pose, MockupPrompts } from '../types';
import { CheckIcon, PencilIcon, TrashIcon, ExportIcon, ImportIcon, LoadingSpinner } from './Icons';

interface SettingsPageProps {
  clothingCategories: string[];
  setClothingCategories: React.Dispatch<React.SetStateAction<string[]>>;
  promptSettings: PromptSettings;
  setPromptSettings: React.Dispatch<React.SetStateAction<PromptSettings>>;
  defaultPromptSettings: PromptSettings;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
    clothingCategories, setClothingCategories, 
    promptSettings, setPromptSettings, defaultPromptSettings
}) => {
    const [activeTab, setActiveTab] = useState('mockup');
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ index: number; name: string } | null>(null);
    const [tempPromptSettings, setTempPromptSettings] = useState(promptSettings);
    const [showSavedNotification, setShowSavedNotification] = useState(false);
    
    // States for Backgrounds tab
    const [newBgTheme, setNewBgTheme] = useState('');
    const [newBgPrompt, setNewBgPrompt] = useState('');
    const [editingBgTheme, setEditingBgTheme] = useState<{ oldName: string; newName: string; prompt: string } | null>(null);

    useEffect(() => { setTempPromptSettings(promptSettings); }, [promptSettings]);
    
    const promptLabels: Record<keyof MockupPrompts, string> = {
        basePrompt: "1. Prompt Base (com Estampa)",
        basePromptNoPrint: "2. Prompt Base (sem Estampa)",
        backWithReferencePrompt: "3. Template: Costas com Referência",
        poseVariationPrompt: "4. Template: Variação de Pose/Modelo",
        standardFrontViewPrompt: "5. Template: Geração Padrão (Frente)",
        standardBackViewPrompt: "6. Template: Geração Padrão (Costas)",
        colorInstruction: "Instrução Injetável: Mudança de Cor",
        noColorInstruction: "Instrução Injetável: Manter Cor Original",
    };

    const promptDescriptions: Record<keyof MockupPrompts, string> = {
        basePrompt: "O prompt principal para roupas COM estampa. Define a persona da IA, o estilo e os requisitos de realismo para aplicar a estampa no tecido.",
        basePromptNoPrint: "O prompt principal para roupas SEM estampa. Focado em renderizar o tecido liso da roupa de forma realista sobre o modelo.",
        backWithReferencePrompt: "Usado para gerar a vista das costas ('Ambos') mantendo o mesmo modelo da vista frontal. Inclui placeholders para instruções de fundo e cor.",
        poseVariationPrompt: "Usado para 'Poses' ou 'Modelos'. Adiciona instruções para manter o modelo consistente. Inclui placeholders para a pose específica e a instrução de cor.",
        standardFrontViewPrompt: "Usado para a geração 'Padrão' (vista frontal). Define uma pose de catálogo simples. Inclui um placeholder para a instrução de cor.",
        standardBackViewPrompt: "Usado para a geração 'Padrão' (vista traseira). Define uma pose de costas simples. Inclui um placeholder para a instrução de cor.",
        colorInstruction: "Substitui o placeholder {colorInstruction} nos outros prompts quando uma cor é selecionada. Contém as instruções precisas para a mudança de cor.",
        noColorInstruction: "Substitui o placeholder {colorInstruction} quando a 'cor original' é selecionada, garantindo que a cor não seja alterada.",
    };


    const handleAddCategory = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !clothingCategories.find(c => c.toLowerCase() === trimmed.toLowerCase())) {
            setClothingCategories(prev => [...prev, trimmed]);
            setNewCategory('');
        }
    };

    const handleUpdateCategory = () => {
        if (!editingCategory) return;
        const trimmed = editingCategory.name.trim();
        if (trimmed && !clothingCategories.find((c, i) => i !== editingCategory.index && c.toLowerCase() === trimmed.toLowerCase())) {
            setClothingCategories(prev => prev.map((c, i) => i === editingCategory.index ? trimmed : c));
            setEditingCategory(null);
        }
    };
    
    const handleDeleteCategory = (indexToDelete: number) => {
        setClothingCategories(prev => prev.filter((_, i) => i !== indexToDelete));
    };

    const handleSaveSettings = () => {
      setPromptSettings(tempPromptSettings);
      setShowSavedNotification(true);
      setTimeout(() => setShowSavedNotification(false), 2000);
    }
    
    const handleResetAll = () => {
      if(window.confirm("Tem certeza que deseja redefinir TODOS os prompts (Mockup, Fundos e Poses) para os valores padrão?")) {
        setTempPromptSettings(defaultPromptSettings);
      }
    }

    const handleAddBgTheme = () => {
      const name = newBgTheme.trim();
      if (name && newBgPrompt.trim() && !tempPromptSettings.backgrounds[name]) {
        setTempPromptSettings(prev => ({
          ...prev,
          backgrounds: { ...prev.backgrounds, [name]: newBgPrompt.trim() }
        }));
        setNewBgTheme('');
        setNewBgPrompt('');
      }
    };

    const handleUpdateBgTheme = () => {
      if (!editingBgTheme) return;
      const { oldName, newName, prompt } = editingBgTheme;
      const trimmedNewName = newName.trim();
      if (!trimmedNewName) return;

      setTempPromptSettings(prev => {
        const newBgs = { ...prev.backgrounds };
        if (oldName !== trimmedNewName) {
          delete newBgs[oldName];
        }
        newBgs[trimmedNewName] = prompt;
        return { ...prev, backgrounds: newBgs };
      });
      setEditingBgTheme(null);
    };

    const handleDeleteBgTheme = (name: string) => {
      if (Object.keys(tempPromptSettings.backgrounds).length <= 1) {
        alert("É necessário manter ao menos um tema de fundo.");
        return;
      }
       if (window.confirm(`Tem certeza que deseja excluir o tema de fundo "${name}"?`)) {
          setTempPromptSettings(prev => {
            const newBgs = { ...prev.backgrounds };
            delete newBgs[name];
            return { ...prev, backgrounds: newBgs };
          });
       }
    };
    
    return (
        <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centro de Controle da IA</h1>
                 <div className="flex justify-end gap-4">
                    <button onClick={handleResetAll} className="bg-gray-500 dark:bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 dark:hover:bg-gray-500">Redefinir Padrão</button>
                    <button onClick={handleSaveSettings} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 relative">
                        {showSavedNotification && <span className="absolute -top-6 -right-2 bg-green-500 text-xs px-2 py-0.5 rounded-full animate-fade-in">Salvo!</span>}
                        Salvar Tudo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">Categorias de Roupa</h2>
                        <div className="space-y-2 mb-4">
                            {clothingCategories.map((cat, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-900/50 p-2 rounded">
                                    {editingCategory?.index === index ? (
                                        <>
                                            <input 
                                                type="text"
                                                value={editingCategory.name}
                                                onChange={(e) => setEditingCategory({ index, name: e.target.value })}
                                                className="flex-grow bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-1"
                                                autoFocus
                                            />
                                            <button onClick={handleUpdateCategory} className="p-2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300"><CheckIcon /></button>
                                            <button onClick={() => setEditingCategory(null)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">&times;</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-grow text-gray-700 dark:text-gray-300">{cat}</span>
                                            <button onClick={() => setEditingCategory({ index, name: cat })} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"><PencilIcon/></button>
                                            <button onClick={() => handleDeleteCategory(index)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon/></button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                placeholder="Nova categoria"
                                className="flex-grow bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2"
                            />
                            <button onClick={handleAddCategory} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500">Adicionar</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h2 className="text-2xl font-bold text-purple-500 dark:text-purple-400 mb-4">Gerenciamento de Prompts</h2>
                     <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
                        <button onClick={() => setActiveTab('mockup')} className={`py-2 px-4 font-semibold ${activeTab === 'mockup' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>Mockup</button>
                        <button onClick={() => setActiveTab('backgrounds')} className={`py-2 px-4 font-semibold ${activeTab === 'backgrounds' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>Fundos</button>
                        <button onClick={() => setActiveTab('poses')} className={`py-2 px-4 font-semibold ${activeTab === 'poses' ? 'text-purple-500 dark:text-purple-400 border-b-2 border-purple-500 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>Poses</button>
                    </div>
                    <div className="space-y-6">
                        {activeTab === 'mockup' && (
                          <div className="space-y-6 animate-fade-in">
                            {(Object.keys(tempPromptSettings.mockup) as Array<keyof MockupPrompts>).map(key => (
                                <div key={key}>
                                    <label htmlFor={key} className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{promptLabels[key]}</label>
                                    <textarea
                                        id={key}
                                        rows={8}
                                        className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2 text-sm font-mono"
                                        value={tempPromptSettings.mockup[key]}
                                        onChange={e => setTempPromptSettings(p => ({...p, mockup: {...p.mockup, [key]: e.target.value}}))}
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{promptDescriptions[key]}</p>
                                </div>
                            ))}
                          </div>
                        )}
                        {activeTab === 'backgrounds' && (
                            <div className="space-y-6 animate-fade-in">
                                <p className="text-gray-500 dark:text-gray-400">Estes prompts descrevem o ambiente que a IA deve criar atrás do modelo. Controlado pelo seletor de 'Fundo' na tela do Criador.</p>
                                {Object.entries(tempPromptSettings.backgrounds).map(([name, prompt]) => (
                                    <div key={name} className="bg-gray-100/50 dark:bg-gray-900/50 p-4 rounded-lg">
                                        {editingBgTheme?.oldName === name ? (
                                            <div className="space-y-2">
                                                <input type="text" value={editingBgTheme.newName} onChange={e => setEditingBgTheme(p => p ? {...p, newName: e.target.value} : null)} className="w-full bg-gray-200 dark:bg-gray-700 p-1 rounded-md border border-gray-300 dark:border-gray-600" />
                                                <textarea value={editingBgTheme.prompt} onChange={e => setEditingBgTheme(p => p ? {...p, prompt: e.target.value} : null)} rows={3} className="w-full bg-gray-200 dark:bg-gray-700 p-1 rounded-md border border-gray-300 dark:border-gray-600 font-mono text-sm" />
                                                <div className="flex gap-2">
                                                    <button onClick={handleUpdateBgTheme} className="bg-green-600 text-sm px-3 py-1 rounded-md">Salvar</button>
                                                    <button onClick={() => setEditingBgTheme(null)} className="bg-gray-500 dark:bg-gray-600 text-white text-sm px-3 py-1 rounded-md">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{name}</h4>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingBgTheme({ oldName: name, newName: name, prompt })} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"><PencilIcon/></button>
                                                        <button onClick={() => handleDeleteBgTheme(name)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon/></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{prompt}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                                <div className="space-y-2 p-4 border-t border-gray-300 dark:border-gray-700">
                                    <h4 className="font-semibold text-lg text-cyan-500 dark:text-cyan-400">Adicionar Novo Tema de Fundo</h4>
                                    <input type="text" value={newBgTheme} onChange={e => setNewBgTheme(e.target.value)} placeholder="Nome do Tema (Ex: Escritório Moderno)" className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600" />
                                    <textarea value={newBgPrompt} onChange={e => setNewBgPrompt(e.target.value)} rows={3} placeholder="Prompt para o novo tema..." className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600 font-mono text-sm" />
                                    <button onClick={handleAddBgTheme} className="bg-cyan-600 px-4 py-2 rounded-md text-sm font-semibold text-white">Adicionar Tema</button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'poses' && (
                            <div className="space-y-6 animate-fade-in">
                                <p className="text-gray-500 dark:text-gray-400">Estes prompts definem a pose que o modelo deve fazer. Usado quando 'Tipo de Geração' está em 'Poses'.</p>
                                {(Object.keys(tempPromptSettings.poses) as Pose[]).map(key => (
                                    <div key={key}>
                                        <label htmlFor={key} className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">{key}</label>
                                        <textarea
                                            id={key}
                                            rows={3}
                                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-md p-2 text-sm font-mono"
                                            value={tempPromptSettings.poses[key]}
                                            onChange={e => setTempPromptSettings(p => ({...p, poses: {...p.poses, [key]: e.target.value}}))}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
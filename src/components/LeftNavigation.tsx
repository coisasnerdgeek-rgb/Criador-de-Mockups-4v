import React from 'react';
import { LogoIcon, CreatorIcon, LightbulbIcon, SparklesIcon, UsersIcon, GalleryIcon, SettingsIcon } from './Icons';

interface LeftNavigationProps {
    activePage: string;
    setActivePage: (page: string) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({ activePage, setActivePage, isExpanded, setIsExpanded }) => {
    const navItems = [
        { id: 'creator', label: 'Criador', icon: CreatorIcon },
        { id: 'inspiration', label: 'Inspiração', icon: LightbulbIcon },
        { id: 'treatment', label: 'Tratamento', icon: SparklesIcon },
        { id: 'associations', label: 'Associações', icon: UsersIcon },
        { id: 'gallery', label: 'Galeria', icon: GalleryIcon },
        { id: 'settings', label: 'IA', icon: SettingsIcon },
    ];

    return (
        <nav 
            className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-60' : 'w-16'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex items-center justify-center h-16 bg-gray-950 flex-shrink-0">
                <LogoIcon className="h-8 w-8 text-cyan-400" />
                {isExpanded && <h1 className="ml-3 text-xl font-bold text-white whitespace-nowrap">Mockups AI</h1>}
            </div>
            <div className="flex-grow p-2 space-y-2 overflow-y-auto scrollbar-hide">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center rounded-md py-2 px-3 transition-colors duration-200 ${activePage === item.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    >
                        <item.icon className="h-6 w-6 flex-shrink-0" />
                        {isExpanded && <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>}
                    </button>
                ))}
            </div>
        </nav>
    );
};
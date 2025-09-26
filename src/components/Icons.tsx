import React from 'react';
import {
    Loader2, Trash2, Pencil, Maximize, Square, RectangleHorizontal, RectangleVertical,
    Sparkles, Download, Image, Check, History, Palette, User, Users, Upload, Archive,
    Move, ZoomIn, Layers, Images, PenTool, ListTodo, Settings, Bookmark, PlusCircle,
    MinusCircle, RotateCcw, Shirt, CreditCard, Tag, Undo2, Share, Import, Sun, Moon,
    Redo2, FileImage, Scale, RotateCw, ChevronLeft, ChevronRight, ZoomOut, Lightbulb,
    ImageOff, UserRound
} from 'lucide-react';

export const LogoIcon: React.FC<{className?: string}> = ({className = "text-cyan-400"}) => (
    // Keeping custom logo as it's unique to the brand
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const LoadingSpinner: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
    <Loader2 className={`animate-spin ${className}`} />
);

export const TrashIcon: React.FC<{className?: string}> = ({className = "h-4 w-4"}) => (
    <Trash2 className={className} />
);

export const PencilIcon: React.FC<{className?: string}> = ({className = "h-4 w-4"}) => (
    <Pencil className={className} />
);

export const AspectRatioFreeIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Maximize className={className} />
);

export const AspectRatioOneOneIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Square className={className} />
);

export const AspectRatioFourThreeIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <RectangleHorizontal className={className} />
);

export const AspectRatioThreeFourIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <RectangleVertical className={className} />
);

export const MagicWandIcon: React.FC<{className?: string}> = ({className = "h-4 w-4"}) => (
    <Sparkles className={className} />
);

export const DownloadIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Download className={className} />
);

export const ImageIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Image className={className} />
);

export const CheckIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Check className={className} />
);

export const HistoryIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <History className={className} />
);

export const OriginalColorIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Palette className={className} /> // Using Palette as a generic color icon
);

export const UsersIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Users className={className} />
);

export const PaletteIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Palette className={className} />
);

export const NoBackgroundIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ImageOff className={className} />
);

export const PersonIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <User className={className} />
);

export const PosesIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <UserRound className={className} /> // Using UserRound as a generic person icon for poses
);

export const UploadIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Upload className={className} />
);

export const ZipIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Archive className={className} />
);

export const PositionIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Move className={className} />
);

export const ZoomInIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ZoomIn className={className} />
);

export const LayersIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Layers className={className} />
);

export const GalleryIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Images className={className} />
);

export const CreatorIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <PenTool className={className} />
);

export const BatchIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ListTodo className={className} />
);

export const SettingsIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Settings className={className} />
);

export const BookmarkIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Bookmark className={className} />
);

export const PlusCircleIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <PlusCircle className={className} />
);

export const MinusCircleIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <MinusCircle className={className} />
);

export const ResetIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <RotateCcw className={className} />
);

export const ClothingIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Shirt className={className} />
);

export const IdCardIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <CreditCard className={className} /> // Using CreditCard as a close match for IdCard
);

export const TagIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Tag className={className} />
);

export const SparklesIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Sparkles className={className} />
);

export const RevertIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Undo2 className={className} />
);

export const ExportIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Share className={className} />
);

export const ImportIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Import className={className} />
);

export const AspectRatioSixteenNineIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <RectangleHorizontal className={className} /> // Generic horizontal rectangle
);

export const AspectRatioNineSixteenIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <RectangleVertical className={className} /> // Generic vertical rectangle
);

export const SunIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Sun className={className} />
);

export const MoonIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Moon className={className} />
);

export const RedoIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Redo2 className={className} />
);

export const PngIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <FileImage className={className} /> // Generic file image icon
);

export const JpgIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <FileImage className={className} /> // Generic file image icon
);

export const ResizeIcon: React.FC<{className?: string}> = ({className = "h-3 w-3 text-white"}) => (
    <Scale className={className} />
);

export const RotateIcon: React.FC<{className?: string}> = ({className = "h-4 w-4 text-white"}) => (
    <RotateCw className={className} />
);

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ChevronLeft className={className} />
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ChevronRight className={className} />
);

export const ZoomOutIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <ZoomOut className={className} />
);

export const ZoomResetIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <Maximize className={className} /> // Using Maximize for zoom reset
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <Lightbulb className={className} />
);
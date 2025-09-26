import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { ZoomInIcon, ZoomOutIcon, ZoomResetIcon } from './Icons';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  controlsVisible?: boolean;
}

const ZOOM_STEP = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className = "w-full h-full object-contain", controlsVisible = false }) => {
  const [scale, setScale] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset position and scale when image source changes
    setScale(MIN_ZOOM);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    if (scale <= MIN_ZOOM) {
        setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleZoomIn = (e: MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  };
  
  const handleZoomOut = (e: MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  };

  const handleReset = (e?: MouseEvent) => {
    e?.stopPropagation();
    setScale(MIN_ZOOM);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (scale <= MIN_ZOOM) return;
    e.preventDefault();
    e.stopPropagation();
    setIsPanning(true);
    setStartPan({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsPanning(false);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !containerRef.current) return;
    e.stopPropagation();
    
    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;

    const { clientWidth, clientHeight } = containerRef.current;
    
    const maxOffsetX = Math.max(0, (clientWidth * scale - clientWidth) / 2);
    const maxOffsetY = Math.max(0, (clientHeight * scale - clientHeight) / 2);

    const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
    const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));

    setPosition({ x: clampedX, y: clampedY });
  };
  
  const controlsClasses = `absolute top-2 left-2 z-10 flex flex-col gap-2 transition-opacity ${controlsVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden rounded-md group"
      style={{ cursor: isPanning ? 'grabbing' : (scale > 1 ? 'grab' : 'default') }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`${className} transition-transform duration-200 ease-out`}
        style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      />
      <div className={controlsClasses}>
        <button
          onClick={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
          className="bg-gray-900/70 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
          title="Aproximar"
          aria-label="Aproximar"
        >
          <ZoomInIcon />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
          className="bg-gray-900/70 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
          title="Afastar"
          aria-label="Afastar"
        >
          <ZoomOutIcon />
        </button>
        {scale > MIN_ZOOM && (
          <button
            onClick={handleReset}
            className="bg-gray-900/70 text-white p-2 rounded-full shadow-lg hover:bg-cyan-600 hover:scale-110 transition-all duration-300"
            title="Resetar Zoom"
            aria-label="Resetar Zoom"
          >
            <ZoomResetIcon />
          </button>
        )}
      </div>
    </div>
  );
};
// app/components/Globe/Globe.tsx

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import createGlobe from 'cobe';
import { GlobeMarker, Stream } from '@/lib/types';
import { PLATFORM_COLORS } from '@/lib/constants';

interface GlobeProps {
  markers: GlobeMarker[];
  focusPoint?: [number, number] | null;
  isAutoRotating: boolean;
  onMarkerClick?: (stream: Stream) => void;
}

export default function Globe({
  markers,
  focusPoint,
  isAutoRotating,
  onMarkerClick,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersOverlayRef = useRef<HTMLDivElement>(null);
  
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const focusRef = useRef<[number, number] | null>(null);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !width) return;

    // Adjust globe size based on zoom
    const globeSize = width * zoom;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: globeSize * 2,
      height: globeSize * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: markers.map((m) => ({
        location: m.location,
        size: 0.05,
      })),
      onRender: (state) => {
        // Smooth auto-rotation
        if (isAutoRotating && pointerInteracting.current === null) {
          phiRef.current += 0.003;
        }

        // Focus transition
        if (focusRef.current) {
          const [lat, lng] = focusRef.current;
          const targetPhi = (((-lng * Math.PI) / 180) + Math.PI) % (2 * Math.PI);
          const targetTheta = ((90 - lat) * Math.PI) / 180 - Math.PI / 2;

          phiRef.current += (targetPhi - phiRef.current) * 0.05;
          thetaRef.current += (targetTheta - thetaRef.current) * 0.05;

          if (
            Math.abs(targetPhi - phiRef.current) < 0.01 &&
            Math.abs(targetTheta - thetaRef.current) < 0.01
          ) {
            focusRef.current = null;
          }
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        
        // Update size dynamically for zoom
        state.width = width * zoom * 2;
        state.height = width * zoom * 2;

        // Update HTML overlays for markers
        if (markersOverlayRef.current) {
          const overlays = markersOverlayRef.current.children;
          const currentZoom = zoom;
          const currentWidth = width;
          
          markers.forEach((m, i) => {
            const overlay = overlays[i] as HTMLElement;
            if (!overlay) return;

            const [lat, lng] = m.location;
            const latRad = (lat * Math.PI) / 180;
            const lngRad = (lng * Math.PI) / 180;

            const x = Math.cos(latRad) * Math.sin(lngRad + state.phi);
            const y = Math.sin(latRad) * Math.cos(state.theta) - Math.cos(latRad) * Math.cos(lngRad + state.phi) * Math.sin(state.theta);
            const z = Math.cos(latRad) * Math.cos(lngRad + state.phi) * Math.cos(state.theta) + Math.sin(latRad) * Math.sin(state.theta);

            if (z > 0) {
              overlay.style.opacity = '1';
              // Calculate position with zoom
              const centerX = currentWidth / 2;
              const centerY = currentWidth / 2;
              const posX = centerX + (x * currentWidth * currentZoom / 2);
              const posY = centerY - (y * currentWidth * currentZoom / 2);
              
              overlay.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${(0.5 + z * 0.5) * Math.sqrt(currentZoom)})`;
              overlay.style.zIndex = Math.floor(z * 100).toString();
            } else {
              overlay.style.opacity = '0';
            }
          });
        }
      },
    });

    return () => globe.destroy();
  }, [width, markers, isAutoRotating, zoom]);

  // Handle Wheel Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const next = prev - e.deltaY * 0.001;
        return Math.min(Math.max(next, 0.5), 5); // Zoom range: 0.5x to 5x
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Update focusRef when focusPoint changes
  useEffect(() => {
    if (focusPoint) {
      focusRef.current = focusPoint;
    }
  }, [focusPoint]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const onPointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      phiRef.current += delta / (200 / zoom); // Slower drag when zoomed in
      pointerInteracting.current = e.clientX;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-w-[800px] mx-auto overflow-hidden select-none cursor-crosshair rounded-full shadow-2xl"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerUp}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
        style={{ transform: `scale(${1})` }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-grab outline-none transition-opacity duration-1000"
          style={{ 
            width: width * zoom, 
            height: width * zoom,
            maxWidth: 'none',
            maxHeight: 'none'
          }}
        />
      </div>
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-2 z-50 pointer-events-auto">
        <button 
          onClick={() => setZoom(z => Math.min(z + 0.5, 5))}
          className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white font-bold hover:bg-white/10 transition-colors"
        >
          +
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))}
          className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white font-bold hover:bg-white/10 transition-colors"
        >
          −
        </button>
      </div>

      {/* Markers Overlay */}
      <div 
        ref={markersOverlayRef}
        className="absolute inset-0 pointer-events-none"
      >
        {markers.map((m) => (
          <div
            key={m.stream.id}
            className="absolute top-0 left-0 pointer-events-auto cursor-pointer group"
            onClick={() => onMarkerClick?.(m.stream)}
            style={{ transition: 'opacity 0.2s' }}
          >
            {/* Pulsing indicator */}
            <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />
            
            {/* Channel Icon */}
            <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-800 transition-transform group-hover:scale-125">
              {m.stream.channelAvatar ? (
                <img 
                  src={m.stream.channelAvatar} 
                  alt={m.stream.channelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                  {m.stream.channelName.substring(0, 2)}
                </div>
              )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] border border-white/10 z-50">
              <div className="font-bold">{m.stream.channelName}</div>
              <div className="text-gray-400">👁 {m.stream.viewerCount.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

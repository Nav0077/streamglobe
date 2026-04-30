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

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
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
        size: 0.05, // Small dots as fallback
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
        state.width = width * 2;
        state.height = width * 2;

        // Update HTML overlays for markers
        if (markersOverlayRef.current) {
          const overlays = markersOverlayRef.current.children;
          markers.forEach((m, i) => {
            const overlay = overlays[i] as HTMLElement;
            if (!overlay) return;

            const [lat, lng] = m.location;
            const latRad = (lat * Math.PI) / 180;
            const lngRad = (lng * Math.PI) / 180;

            const x = Math.cos(latRad) * Math.sin(lngRad + state.phi);
            const y = Math.sin(latRad) * Math.cos(state.theta) - Math.cos(latRad) * Math.cos(lngRad + state.phi) * Math.sin(state.theta);
            const z = Math.cos(latRad) * Math.cos(lngRad + state.phi) * Math.cos(state.theta) + Math.sin(latRad) * Math.sin(state.theta);

            // Only show if on the front side of the globe
            if (z > 0) {
              overlay.style.opacity = '1';
              overlay.style.transform = `translate(-50%, -50%) translate(${width / 2 + x * width / 2}px, ${width / 2 - y * width / 2}px) scale(${0.5 + z * 0.5})`;
              overlay.style.zIndex = Math.floor(z * 100).toString();
            } else {
              overlay.style.opacity = '0';
            }
          });
        }
      },
    });

    return () => globe.destroy();
  }, [width, markers, isAutoRotating]);

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
      phiRef.current += delta / 200;
      pointerInteracting.current = e.clientX;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-w-[800px] mx-auto overflow-visible select-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab outline-none"
        style={{ width: '100%', height: '100%' }}
      />
      
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

// app/components/Globe/Globe.tsx

'use client';

import { useRef, useEffect, useCallback } from 'react';
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
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const focusRef = useRef<[number, number] | null>(null);
  const globeRef = useRef<any>(null);

  // Update focus point
  useEffect(() => {
    if (focusPoint) {
      focusRef.current = focusPoint;
    }
  }, [focusPoint]);

  useEffect(() => {
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener('resize', onResize);

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 36000,
      mapBrightness: 2,
      baseColor: [0.05, 0.05, 0.1],
      markerColor: [1, 0.2, 0.2],
      glowColor: [0.08, 0.08, 0.2],
      markers: markers.map((m) => ({
        location: m.location,
        size: m.size,
      })),
      onRender: (state) => {
        // Auto rotation
        if (isAutoRotating && pointerInteracting.current === null) {
          phiRef.current += 0.003;
        }

        // Focus on a specific point
        if (focusRef.current) {
          const [lat, lng] = focusRef.current;
          const targetPhi = (((-lng * Math.PI) / 180) + Math.PI) % (2 * Math.PI);
          const targetTheta = ((90 - lat) * Math.PI) / 180 - Math.PI / 2;

          phiRef.current += (targetPhi - phiRef.current) * 0.05;
          thetaRef.current += (targetTheta - thetaRef.current) * 0.05;

          // Clear focus after reaching target
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

        // Update markers dynamically
        state.markers = markers.map((m) => ({
          location: m.location,
          size: m.size,
        }));
      },
    });

    globeRef.current = globe;

    // Pointer interaction for drag
    const canvas = canvasRef.current;

    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = 'grab';
    };

    const onPointerOut = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = 'grab';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        phiRef.current += delta / 200;
        pointerInteracting.current = e.clientX;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerout', onPointerOut);
    canvas.addEventListener('pointermove', onPointerMove);

    return () => {
      globe.destroy();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerout', onPointerOut);
      canvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
    };
  }, [markers, isAutoRotating]);

  // Handle click on canvas - find nearest marker
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onMarkerClick || !canvasRef.current) return;
      if (Math.abs(pointerInteractionMovement.current) > 5) return; // Was dragging

      // Simple proximity-based marker detection
      // In production, use ray casting
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Find the closest marker to click position
      // This is a simplified version - for production use proper 3D picking
      if (markers.length > 0) {
        // For now, trigger on any click when markers exist
        const nearestMarker = findNearestMarkerToScreenPoint(
          x, y, markers, phiRef.current, thetaRef.current
        );
        if (nearestMarker) {
          onMarkerClick(nearestMarker.stream);
        }
      }
    },
    [markers, onMarkerClick]
  );

  return (
    <div className="globe-container relative w-full aspect-square max-w-[800px] mx-auto">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="w-full h-full cursor-grab"
        style={{
          contain: 'layout paint size',
          opacity: 1,
          transition: 'opacity 1s ease',
        }}
      />
      {/* Marker tooltips rendered as HTML overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Tooltip overlays go here */}
      </div>
    </div>
  );
}

// Simplified nearest marker finder
function findNearestMarkerToScreenPoint(
  x: number,
  y: number,
  markers: GlobeMarker[],
  phi: number,
  theta: number
): GlobeMarker | null {
  let nearest: GlobeMarker | null = null;
  let minDist = Infinity;

  for (const marker of markers) {
    const [lat, lng] = marker.location;
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Convert to 3D coordinates
    const mx = Math.cos(latRad) * Math.cos(lngRad + phi);
    const my = Math.sin(latRad);
    const mz = Math.cos(latRad) * Math.sin(lngRad + phi);

    // Simple projection (not exact but good enough for click detection)
    const screenX = mx;
    const screenY = my * Math.cos(theta) - mz * Math.sin(theta);

    const dist = Math.sqrt((screenX - x) ** 2 + (screenY - y) ** 2);

    if (dist < minDist && dist < 0.15) {
      // 0.15 click radius threshold
      minDist = dist;
      nearest = marker;
    }
  }

  return nearest;
}

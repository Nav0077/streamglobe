// hooks/useGlobe.ts

import { useState, useCallback, useRef } from 'react';
import { Stream } from '@/lib/types';

interface GlobeState {
  selectedStream: Stream | null;
  isPanelOpen: boolean;
  focusPoint: [number, number] | null;
  isAutoRotating: boolean;
}

export function useGlobe() {
  const [state, setState] = useState<GlobeState>({
    selectedStream: null,
    isPanelOpen: false,
    focusPoint: null,
    isAutoRotating: true,
  });

  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);

  const selectStream = useCallback((stream: Stream) => {
    setState({
      selectedStream: stream,
      isPanelOpen: true,
      focusPoint: [stream.latitude, stream.longitude],
      isAutoRotating: false,
    });
  }, []);

  const closePanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedStream: null,
      isPanelOpen: false,
      isAutoRotating: true,
    }));
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAutoRotating: !prev.isAutoRotating,
    }));
  }, []);

  return {
    ...state,
    phiRef,
    thetaRef,
    selectStream,
    closePanel,
    toggleAutoRotate,
  };
}

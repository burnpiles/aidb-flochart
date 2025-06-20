// src/hooks/useAutoCenterFlow.js
import { useEffect } from 'react';

export default function useAutoCenterFlow(flowRef, deps = []) {
  useEffect(() => {
    const inst = flowRef?.current;
    if (inst) {
      setTimeout(() => {
        inst.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 400 });
      }, 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowRef, ...deps]);
}
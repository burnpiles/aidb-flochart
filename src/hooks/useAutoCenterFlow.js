// src/hooks/useAutoCenterFlow.js
import { useEffect } from 'react';

export default function useAutoCenterFlow(flowRef, deps = []) {
  useEffect(() => {
    const inst = flowRef?.current;
    if (inst?.fitView) {
      inst.fitView({ padding: 0.2 });
    }
  }, deps);
}
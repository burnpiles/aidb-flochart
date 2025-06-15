// src/utils/generateFlowEdges.js
export function generateFlowEdges(selectedTools) {
    const edges = [];
    if (!Array.isArray(selectedTools) || selectedTools.length < 2) {
      return edges;
    }
    for (let i=0; i<selectedTools.length-1; i++) {
      const from = selectedTools[i];
      const to = selectedTools[i+1];
      edges.push({
        id: `edge-${from}-${to}`,
        source: `tool-${from}`,
        target: `tool-${to}`,
        type: 'step',  // ensures a “staircase” from top-left to bottom-right
        style: { stroke: '#333', strokeWidth: 2 }
      });
    }
    return edges;
  }
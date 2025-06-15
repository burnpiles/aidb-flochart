// src/utils/generateEdges.js

/**
 * generateUserEdges – for the actual lines the user draws manually
 */
export function generateUserEdges(edgesInState) {
  if (!Array.isArray(edgesInState)) return [];
  const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

  return edgesInState.map((edge, idx) => ({
    ...edge,
    type: 'smoothstep',
    style: {
      stroke: colors[idx % colors.length],
      strokeWidth: 3,
    },
    animated: false,
    markerEnd: {
      type: 'arrowclosed',
      color: colors[idx % colors.length],
    },
  }));
}

/**
 * generateSuggestedEdges – ephemeral “next step” lines for partial flows
 */
export function generateSuggestedEdges(connectedToolsLC, partialFlows) {
  if (!Array.isArray(partialFlows) || partialFlows.length === 0) return [];

  const flowColors = ['#ff9900', '#007acc', '#cc00cc', '#00aa00', '#ff4444'];
  const usedColors = {};
  let colorIndex = 0;

  const edges = [];

  partialFlows.forEach((pFlow) => {
    if (pFlow.isComplete) return;
    let color = usedColors[pFlow.flow];
    if (!color) {
      color = flowColors[colorIndex % flowColors.length];
      colorIndex++;
      usedColors[pFlow.flow] = color;
    }

    const nextLC = (pFlow.nextTools || []).map((x) => x.toLowerCase());
    if (!nextLC.length) return;

    connectedToolsLC.forEach((userTool, i) => {
      if (!nextLC.includes(userTool)) {
        nextLC.forEach((candidate, j) => {
          if (candidate === userTool) return;
          edges.push({
            id: `suggested-${pFlow.flow}-${userTool}-${candidate}`,
            source: `tool-${userTool}`,
            target: `tool-${candidate}`,
            type: 'bezier',
            animated: true,
            style: {
              stroke: color,
              strokeDasharray: '5,5',
              strokeWidth: 3,
            },
            markerEnd: { type: 'arrowclosed', color },
          });
        });
      }
    });
  });

  return edges;
}
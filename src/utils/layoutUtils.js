// src/utils/layoutUtils.js

export function reorderNodesWithFlowMode(nodesIn, selectedToolsOrder) {
  const idMap = {};
  nodesIn.forEach(n => { idMap[n.id] = n; });

  const chainNodes = [];
  const chainIds = new Set();
  selectedToolsOrder.forEach(tool => {
    const id = `tool-${tool}`;
    if (idMap[id] && !chainIds.has(id)) {
      chainNodes.push(idMap[id]);
      chainIds.add(id);
    }
  });

  const outside = nodesIn.filter(n => !chainIds.has(n.id));

  const buckets = { green: [], yellow: [], white: [] };
  outside.forEach(node => {
    const bg = node.data?.background?.toLowerCase() || '';
    if (bg.includes('#ccffcc')) buckets.green.push(node);
    else if (bg.includes('#fffcc9')) buckets.yellow.push(node);
    else buckets.white.push(node);
  });

  Object.values(buckets).forEach(arr =>
    arr.sort((a, b) => a.data.toolName.localeCompare(b.data.toolName))
  );

  // Diagonal layout for flow chain
  chainNodes.forEach((node, i) => {
    node.position = {
      x: 100 + i * 180,
      y: 100 + i * 120
    };
  });

  // Grid layout for remaining tools
  const allOthers = [...buckets.green, ...buckets.yellow, ...buckets.white];
  const spacingY = 80;
  const fullWidth = window.innerWidth;
  const margin = 120;
  const nodeWidth = 200;
  const nodeSpacing = 32;

  const rawCols = Math.floor((fullWidth - margin * 2 + nodeSpacing) / (nodeWidth + nodeSpacing));
  const cols = Math.max(1, rawCols - 2);

  allOthers.forEach((node, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    node.position = {
      x: margin + col * (nodeWidth + nodeSpacing),
      y: 40 + chainNodes.length * 120 + row * spacingY
    };
  });

  return [...chainNodes, ...allOthers];
}
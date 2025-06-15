// src/utils/generateToolNodes.js
import { cleanCategory } from './flowUtils';
import { Position } from 'reactflow';

export function generateToolNodes({
  toolsData = {},
  tagsData = {},
  selectedCategories = [],
  selectedSubcategories = [],
  highlightedTools = [],
  selectedTools = [],
  connectedToolNames = [],
  suggestedTools = [],
  showOnlyFlowTools = false,
  matchMode = 'some',
  flowMatchScores = {},
  isMobile = false,
  stepLabelsMap = {}
}) {
  const toolArray = Object.entries(toolsData).sort((a, b) => a[0].localeCompare(b[0]));

  const spacingX = 240;
  const spacingY = 100;
  const offsetX = 0;
  const offsetY = 0;
  const canvas = document.querySelector('.react-flow-wrapper');
  const width = canvas?.offsetWidth || 1000;
  const usableWidth = Math.max(width - 40, 400);
  const numCols = Math.max(Math.floor(usableWidth / spacingX), 1);

  const colorGreen = '#ccffcc';
  const colorYellow = '#fffcc9';
  const colorWhite = 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)';

  const catLC = selectedCategories.map(c => c.toLowerCase());
  const subcatLC = selectedSubcategories.map(s => s.toLowerCase());
  const selectedLC = selectedTools.map(s => s.toLowerCase());
  const connectedLC = connectedToolNames.map(s => s.toLowerCase());

  return toolArray.map(([toolName, toolData], index) => {
    const nameLC = toolName.toLowerCase();
    const toolTags = (toolData.tags || []).map(t => cleanCategory(t));

    let background = colorWhite;
    const isSubcatMatch = subcatLC.some(sub => toolTags.includes(sub));
    const isCatMatch = catLC.some(cat => toolTags.includes(cat));
    if (subcatLC.length) {
      if (isSubcatMatch) background = colorGreen;
      else if (isCatMatch) background = colorYellow;
    } else if (catLC.length) {
      if (isCatMatch) background = colorGreen;
    }

    let hidden = false;
    if (showOnlyFlowTools) {
  if (selectedLC.length > 0 && !selectedLC.includes(nameLC)) hidden = true;
  if (connectedLC.length > 0 && !connectedLC.includes(nameLC)) hidden = true;
}

    const col = index % numCols;
    const row = Math.floor(index / numCols);
    const position = {
      x: offsetX + col * spacingX,
      y: offsetY + row * spacingY
    };

    return {
      id: `tool-${toolName}`,
      type: 'tool',
      data: {
        toolName,
        toolData,
        background,
        stepLabel: stepLabelsMap[nameLC] || ''
      },
      position,
      style: {
        width: 200,
        height: 40,
        border: '1px solid #bbb',
        borderRadius: '8px',
        background
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      hidden
    };
  });
}
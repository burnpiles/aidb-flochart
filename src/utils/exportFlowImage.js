// src/utils/exportFlowImage.js

import { toPng } from 'html-to-image';

/**
 * Exports the current React Flow diagram as a PNG.
 * @param {Object} reactFlowInstance - The React Flow instance ref, e.g. `reactFlowInstance.current`.
 * @param {Object} reactFlowWrapperRef - The wrapper DOM element ref, e.g. `reactFlowWrapperRef.current`.
 */
export async function exportFlowImage(reactFlowInstance, reactFlowWrapperRef) {
  if (!reactFlowInstance || !reactFlowWrapperRef) return;

  // Get only the visible nodes
  const { getNodes } = reactFlowInstance;
  const visibleNodes = getNodes().filter(n => !n.hidden);
  if (visibleNodes.length === 0) return;

  // Determine clip area with some padding
  const padding = 50;
  const xValues = visibleNodes.map(n => n.position.x);
  const yValues = visibleNodes.map(n => n.position.y);
  const minX = Math.min(...xValues) - padding;
  const minY = Math.min(...yValues) - padding;
  const maxX = Math.max(...xValues) + padding;
  const maxY = Math.max(...yValues) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  try {
    const dataUrl = await toPng(reactFlowWrapperRef, {
      clip: { x: minX, y: minY, width, height }
    });

    const link = document.createElement('a');
    link.download = 'flowchart.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
}
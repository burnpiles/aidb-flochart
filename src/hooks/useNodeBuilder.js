// src/hooks/useNodeBuilder.js
import { useEffect, useState } from 'react';
import { reorderNodesWithFlowMode } from '../utils/layoutUtils';
import { generateToolNodes } from '../utils/generateToolNodes';

export default function useNodeBuilder({
  toolsData,
  tagsData,
  selectedCategory,
  selectedSubcategory,
  selectedTags,
  selectedTools,
  connectedToolNames,
  tagMatchMode,
  isMobile,
  stepLabelsMap,
  showOnlyFlowTools = false,
}) {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const newNodes = generateToolNodes({
      toolsData,
      tagsData,
      selectedCategories: selectedCategory ? [selectedCategory] : [],
      selectedSubcategories: selectedSubcategory ? [selectedSubcategory] : [],
      highlightedTools: selectedTags,
      selectedTools,
      showOnlyFlowTools,
      connectedToolNames,
      suggestedTools: [],
      matchMode: tagMatchMode,
      isMobile,
      stepLabelsMap,
    });

    const positioned = reorderNodesWithFlowMode(newNodes, selectedTools);
    setNodes(positioned);
  }, [
    toolsData,
    tagsData,
    selectedCategory,
    selectedSubcategory,
    selectedTags,
    selectedTools,
    connectedToolNames,
    tagMatchMode,
    isMobile,
    stepLabelsMap,
    showOnlyFlowTools,
  ]);

  return nodes;
}
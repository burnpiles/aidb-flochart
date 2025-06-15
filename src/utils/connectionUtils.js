// src/utils/connectionUtils.js

export const updateFiltersFromConnection = (sourceTool, targetTool, tagsData) => {
  const combinedTags = new Set([
    ...(sourceTool.tags || []),
    ...(targetTool.tags || []),
  ]);
  const primaryCategory = [...combinedTags].find((tag) =>
    Object.keys(tagsData).includes(tag)
  );
  const subcategory = primaryCategory
    ? [...combinedTags].find((tag) =>
        (tagsData[primaryCategory] || []).includes(tag)
      )
    : null;
  return {
    category: primaryCategory || null,
    subcategory: subcategory || null,
  };
};

/**
 * detectPartialFlowMatches
 * enforces strict step order:
 */
export const detectPartialFlowMatches = (connectedTools, flowData, focusFlow = '') => {
  const suggestions = [];
  if (!Array.isArray(connectedTools) || connectedTools.length < 1) {
    return suggestions;
  }

  const allFlowsArr = Object.values(flowData).flatMap((x) => x);
  const relevant = focusFlow
    ? allFlowsArr.filter((f) => f.title.toLowerCase() === focusFlow.toLowerCase())
    : allFlowsArr;

  const ctoolsLC = connectedTools.map((t) => t.toLowerCase());

  relevant.forEach((flow) => {
    const steps = flow?.steps || [];
    if (!steps.length) return;

    // each step => array of possible tools
    const stepToolGroups = steps.map((st) =>
      Array.isArray(st.tools) ? st.tools.map((x) => x.toLowerCase()) : []
    );

    let matchCount = 0;
    for (let i = 0; i < stepToolGroups.length; i++) {
      const needed = stepToolGroups[i];
      // if user has any needed tool => step matched
      const found = ctoolsLC.some((ut) => needed.includes(ut));
      if (found) {
        matchCount++;
      } else {
        break;
      }
    }
    if (matchCount === 0) return;

    const matchPercent = matchCount / stepToolGroups.length;
    if (matchCount === stepToolGroups.length) {
      // complete
      suggestions.push({
        flow: flow.title,
        matchedCount: matchCount,
        matchPercent,
        isComplete: true,
        nextTools: [],
        remainingTools: [],
      });
    } else {
      // partial
      const nextGroup = stepToolGroups[matchCount] || [];
      const nextTools = nextGroup.filter((nt) => !ctoolsLC.includes(nt));
      const remaining = stepToolGroups.slice(matchCount).flat();
      suggestions.push({
        flow: flow.title,
        matchedCount: matchCount,
        matchPercent,
        isComplete: false,
        nextTools,
        remainingTools: remaining,
      });
    }
  });

  return suggestions;
};
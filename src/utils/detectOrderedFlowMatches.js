export const detectOrderedFlowMatches = (orderedToolPath, flowData) => {
  const suggestions = [];
  if (!Array.isArray(orderedToolPath) || orderedToolPath.length < 1) return suggestions;

  Object.entries(flowData).forEach(([_, flows]) => {
    flows.forEach(flow => {
      if (!flow || !Array.isArray(flow.steps)) return;

      const stepToolGroups = flow.steps.map(step => Array.isArray(step?.tools) ? step.tools : []);
      let matchCount = 0;

      for (let i = 0; i < orderedToolPath.length && i < stepToolGroups.length; i++) {
        const tool = orderedToolPath[i];
        const validTools = stepToolGroups[i];
        if (validTools.includes(tool)) {
          matchCount++;
        } else {
          break;  // Stop matching if any step is incorrect
        }
      }

      const matchPercent = matchCount / stepToolGroups.length;
      if (matchCount === 0) return;

      if (matchCount === stepToolGroups.length) {
        suggestions.push({
          flow: flow.title,
          matchedCount: matchCount,
          matchPercent,
          isComplete: true
        });
      } else {
        const remaining = stepToolGroups.slice(matchCount).flat();
        suggestions.push({
          flow: flow.title,
          matchedCount: matchCount,
          matchPercent,
          nextTool: remaining[0],
          remainingTools: remaining,
          isComplete: false
        });
      }
    });
  });

  return suggestions;
};
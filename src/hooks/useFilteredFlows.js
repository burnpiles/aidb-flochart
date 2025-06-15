// src/hooks/useFilteredFlows.js
import { useMemo } from 'react';

export default function useFilteredFlows(allFlows, selectedCategory, selectedSubcategory) {
  return useMemo(() => {
    const arr = Object.values(allFlows || {}).flatMap(x => x);
    const catLC = selectedCategory?.toLowerCase();
    const subLC = selectedSubcategory?.toLowerCase();

    return arr.map(f => {
      const tagsLC = (f.tags || []).map(t => t.toLowerCase());
      let relevance = 'grey';
      if (subLC && tagsLC.includes(subLC)) relevance = 'green';
      else if (catLC && tagsLC.includes(catLC)) relevance = subLC ? 'yellow' : 'green';
      return { ...f, relevance };
    });
  }, [allFlows, selectedCategory, selectedSubcategory]);
}
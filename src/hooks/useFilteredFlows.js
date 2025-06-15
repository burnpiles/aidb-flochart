// src/hooks/useFilteredFlows.js
import { useMemo } from 'react';

export default function useFilteredFlows(allFlows, selectedCategory, selectedSubcategory, selectedTags = [], tagMatchMode = 'some') {
  return useMemo(() => {
    const arr = Object.values(allFlows || {}).flatMap(x => x);
    const tagsLC = selectedTags.map(t => t.toLowerCase());

    return arr.map(f => {
      const toolTags = (f.tags || []).map(t => t.toLowerCase());

      // default grey
      let relevance = 'grey';

      if (tagsLC.length === 0) return { ...f, relevance };

      const matchCount = tagsLC.filter(tag => toolTags.includes(tag)).length;

      const isMatch =
        tagMatchMode === 'every' ? matchCount === tagsLC.length :
        tagMatchMode === 'some' ? matchCount > 0 :
        false;

      if (isMatch) {
        relevance = matchCount === tagsLC.length ? 'green' : 'yellow';
      }

      return { ...f, relevance };
    });
  }, [allFlows, selectedTags, tagMatchMode]);
}
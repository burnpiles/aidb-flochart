// src/hooks/useFilters.js
import { useState, useCallback } from 'react';

export default function useFilters() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMatchMode, setTagMatchMode] = useState('some');

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedTags([]);
    setTagMatchMode('some');
  }, []);

  const applyTagFilter = useCallback((tag) => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedTags([tag.toLowerCase()]);
    setTagMatchMode('every');
  }, []);

  const applyCategoryFilter = useCallback((cat, sub, tagsData) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
    if (!cat) {
      setSelectedTags([]);
      setTagMatchMode('some');
    } else {
      const base = cat.toLowerCase();
      if (sub) {
        setSelectedTags([sub.toLowerCase()]);
        setTagMatchMode('every');
      } else {
        const arr = tagsData[base] || [];
        setSelectedTags([base, ...arr.map(t => t.toLowerCase())]);
        setTagMatchMode('some');
      }
    }
  }, []);

  return {
    selectedCategory,
    selectedSubcategory,
    selectedTags,
    tagMatchMode,
    clearFilters,
    applyTagFilter,
    applyCategoryFilter
  };
}
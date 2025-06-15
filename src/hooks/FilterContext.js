// src/hooks/FilterContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext();

export function FiltersProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [highlightedTools, setHighlightedTools] = useState([]);
  const [tagMatchMode, setTagMatchMode] = useState('every');

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedTags([]);
    setHighlightedTools([]);
    setTagMatchMode('every');
  }, []);

  const applyTagFilter = useCallback((tag) => {
    const lowerTag = tag.toLowerCase();
    setSelectedTags([lowerTag]);
    setHighlightedTools([lowerTag]);
    setTagMatchMode('some');
  }, []);

  const applyCategoryFilter = useCallback((cat, sub, tagsData = {}) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub || '');
    if (!cat) {
      setSelectedTags([]);
      setHighlightedTools([]);
      return;
    }

    const base = cat.toLowerCase();
    const subLC = sub?.toLowerCase();
    const arr = tagsData[base] || [];
    const tagList = subLC ? [base, ...arr.map(t => t.toLowerCase())] : [base];

    setSelectedTags(tagList);
    setHighlightedTools(tagList);
    setTagMatchMode(subLC ? 'some' : 'every');
  }, []);

  return (
    <FilterContext.Provider value={{
      selectedCategory,
      selectedSubcategory,
      selectedTags,
      highlightedTools,
      tagMatchMode,
      setSelectedTags,
      setHighlightedTools,
      applyTagFilter,
      applyCategoryFilter,
      clearFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside a <FiltersProvider>');
  return ctx;
}
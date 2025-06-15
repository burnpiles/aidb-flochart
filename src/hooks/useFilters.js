// hooks/useFilters.js
import { useState, useEffect } from 'react';

export const useFilters = (toolsData, searchQuery) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  useEffect(() => {
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return;

    const catSet = new Set();
    const subSet = new Set();

    Object.values(toolsData).forEach(tool => {
      const cats = tool.Category?.split(',').map(s => s.trim().toLowerCase()) || [];
      const subs = tool.Subcategory?.split(',').map(s => s.trim().toLowerCase()) || [];

      cats.forEach(cat => { if (terms.includes(cat)) catSet.add(cat); });
      subs.forEach(sub => { if (terms.includes(sub)) subSet.add(sub); });
    });

    setSelectedCategories([...catSet]);
    setSelectedSubcategories([...subSet]);
  }, [searchQuery, toolsData]);

  const toggleCategory = (raw) => {
    const clean = raw.toLowerCase().trim();
    setSelectedCategories(prev =>
      prev.includes(clean) ? prev.filter(c => c !== clean) : [...prev, clean]
    );
  };

  const toggleSubcategory = (raw) => {
    const clean = raw.toLowerCase().trim();
    setSelectedSubcategories(prev =>
      prev.includes(clean) ? prev.filter(s => s !== clean) : [...prev, clean]
    );
  };

  return {
    selectedCategories,
    setSelectedCategories,
    selectedSubcategories,
    setSelectedSubcategories,
    toggleCategory,
    toggleSubcategory
  };
};

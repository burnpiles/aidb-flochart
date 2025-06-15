// utils/flowUtils.js
export const cleanCategory = str =>
  str.replace(/[^\w\s]/g, '').trim().toLowerCase();

export const getColumns = str =>
  str?.split(',').map(s => s.trim()) || [];

// src/components/ToolCard.js
import React from 'react';

export default function ToolCard({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        marginBottom: 8,
        padding: '12px 14px',
        borderRadius: 6,
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: '1rem'
      }}
    >
      {title}
    </button>
  );
}
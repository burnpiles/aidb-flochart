// src/components/LegendBar.js
import React from 'react';

export default function LegendBar() {
  const items = [
    { label: 'Connected', icon: '→', isArrow: true },
    { label: 'Match', color: '#ccffcc' },
    { label: 'Related', color: '#fffcc9' }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'left', gap: '24px',
                  alignItems: 'center', margin: '8px 100px' }}>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {it.isArrow ? (
            <div style={{ fontSize: '1.2rem', color: '#333' }}>{it.icon}</div>
          ) : (
            <div style={{
              width: 16, height: 16, background: it.color,
              border: '1px solid #888', borderRadius: '50%'
            }} />
          )}
          <span style={{ fontSize: '0.9rem' }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
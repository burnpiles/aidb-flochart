// components/SearchControls.js
import React from 'react';

const SearchControls = ({
  searchQuery,
  handleSearchChange,
  suggestions,
  handleSuggestionClick,
  handleClear,
  handleExport
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', position: 'relative' }}>
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder="What are you trying to build?"
      style={{ width: '100%', padding: '6px 8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
    />

    {suggestions.length > 0 && (
      <div style={{
        position: 'absolute',
        top: '38px',
        left: 0,
        right: 0,
        background: '#fff',
        border: '1px solid #ccc',
        zIndex: 2
      }}>
        {suggestions.map((sug, idx) => (
          <div
            key={idx}
            onClick={() => handleSuggestionClick(sug)}
            style={{
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              borderBottom: '1px solid #eee'
            }}
          >
            {sug}
          </div>
        ))}
      </div>
    )}

    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleClear}
        style={{
          flex: 1,
          padding: '6px',
          fontSize: '0.85rem',
          cursor: 'pointer'
        }}
      >
        CLEAR SEARCH
      </button>
    </div>
  </div>
);

export default SearchControls;
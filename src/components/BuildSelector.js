// src/components/BuildSelector.js
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const GREEN = '#ccffcc';
const YELLOW = '#fffcc9';
const BORDER_DEFAULT = '#ccc';
const DARK_GREY = '#d4d4d4';
const LIGHT_RED = '#f55f4e';

const BuildSelector = forwardRef(({ heading = "What do you want to build?", onFilterChange }, ref) => {
  const [tagsData, setTagsData] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetch('/tags.json')
      .then(res => res.json())
      .then(setTagsData)
      .catch(console.error);
  }, []);

  const handleMainClick = (cat) => {
    if (cat === activeCategory && !activeSubcategory) {
      setActiveCategory(null);
      onFilterChange(null, null);
    } else if (cat === activeCategory && activeSubcategory) {
      setActiveSubcategory(null);
      onFilterChange(cat, null);
    } else {
      setActiveCategory(cat);
      setActiveSubcategory(null);
      onFilterChange(cat, null);
      if (isMobile) {
        setTimeout(() => {
          const el = document.getElementById('tools-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleSubClick = (sub) => {
    if (sub === activeSubcategory) {
      setActiveSubcategory(null);
      onFilterChange(activeCategory, null);
    } else {
      setActiveSubcategory(sub);
      onFilterChange(activeCategory, sub);
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setActiveCategory(null);
      setActiveSubcategory(null);
    }
  }));

  const sortedCategories = Object.entries(tagsData).sort((a, b) => {
    if (a[0] === 'featured') return -1;
    if (b[0] === 'featured') return 1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {['featured', 'assistants'].map(catKey => (
          <button
            key={catKey}
            onClick={() => handleMainClick(catKey)}
            style={{
              width: '100%',
              padding: '14px 18px',
              fontSize: '1.1rem',
              borderRadius: '12px',
              textAlign: 'left',
              border: `2px solid ${BORDER_DEFAULT}`,
              background: catKey === activeCategory ? GREEN : DARK_GREY,
              color: '#000',
              cursor: 'pointer'
            }}
          >
            {getEmoji(catKey)} {titleCase(catKey)}
          </button>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '2px solid #222', margin: '16px 0' }} />

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{heading}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {sortedCategories.filter(([key]) => key !== 'featured' && key !== 'assistants').map(([catKey, subItems]) => {
          const isCatActive = (catKey === activeCategory);
          const catBgColor = isCatActive ? (activeSubcategory ? YELLOW : GREEN) : '#f0f0f0';
          const catBorderColor = isCatActive ? (activeSubcategory ? YELLOW : GREEN) : BORDER_DEFAULT;

          return (
            <div key={catKey}>
              <button
                onClick={() => handleMainClick(catKey)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  textAlign: 'left',
                  border: `2px solid ${catBorderColor}`,
                  background: catBgColor,
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                {getEmoji(catKey)} {titleCase(catKey)}
              </button>

              {!isMobile && isCatActive && subItems.length > 0 && (
                <div className="subcategory-row" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {subItems.map(subItem => {
                    const isSubActive = (subItem === activeSubcategory);
                    const subBg = isSubActive ? GREEN : '#fff';
                    const subBorder = isSubActive ? GREEN : '#bbb';

                    return (
                      <button
                        key={subItem}
                        onClick={() => handleSubClick(subItem)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          fontSize: '0.95rem',
                          borderRadius: '10px',
                          border: `1px solid ${subBorder}`,
                          background: subBg,
                          color: '#000',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {subItem}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr style={{ border: 'none', borderTop: '2px solid #222', margin: '20px 0' }} />

      <button
        onClick={() => window.open("https://form.typeform.com/to/ioNBViWo", "_blank")}
        style={{
          width: '100%',
          padding: '14px 18px',
          fontSize: '1.1rem',
          borderRadius: '12px',
          textAlign: 'center',
          background: '#3399ff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '12px'
        }}
      >
        👨🏻‍💻 Submit Tool
      </button>

    </div>
  );
});

function getEmoji(key) {
  const emojis = {
    featured: '⭐',
    assistants: '🤖',
    audio: '🎵',
    video: '🎥',
    images: '🖼️',
    code: '💻',
    write: '✍️'
  };
  return emojis[key] || '';
}

function titleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default BuildSelector;
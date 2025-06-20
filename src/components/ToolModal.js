import React, { useEffect, useState } from 'react';
import { useFilters } from '../hooks/FilterContext';

const ALLOWED_MODAL_TAGS = [
  'featured', 'assistants', 'code', 'audio', 'images', 'video', 'write'
];

const socialIcons = {
  Instagram: 'https://img.icons8.com/ios-filled/50/instagram-new.png',
  X: 'https://img.icons8.com/ios-filled/50/twitterx--v2.png',
  LinkedIn: 'https://img.icons8.com/ios-filled/50/linkedin.png',
};

export default function ToolModal({ tool, onClose }) {
  const { applyCategoryFilter } = useFilters();
  const [tagsMap, setTagsMap] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetch('/tags.json').then(r => r.json()).then(setTagsMap);
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!tool) return null;

  const getYouTubeID = (url) => {
    try {
      const u = new URL(url);
      if (!u.hostname.includes('youtu')) return null;
      return u.searchParams.get('v') || u.pathname.split('/').pop();
    } catch {
      return null;
    }
  };

  const renderYouTubeEmbed = (url) => {
    const id = getYouTubeID(url);
    if (!id) return null;
    return (
      <iframe
        width="100%"
        height="300"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube Tutorial"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '10px', marginTop: 16 }}
      />
    );
  };

  const handleTagClick = (tag) => {
    const lower = tag.toLowerCase();
    const entry = Object.entries(tagsMap).find(([parent, subs]) =>
      parent === lower || subs.includes(lower)
    );

    const parent = entry?.[0] || null;
    const isSub = entry?.[1]?.includes(lower);

    applyCategoryFilter(isSub ? parent : lower, isSub ? lower : null, tagsMap);

    setTimeout(() => {
      onClose?.();
      const el = document.getElementById('tools-anchor');
      if (window.innerWidth < 768 && el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const allowedTags = tool.tags?.filter(tag =>
    ALLOWED_MODAL_TAGS.includes(tag.toLowerCase())
  ) || [];

  const secondaryTags = tool.tags?.filter(tag => {
    const lower = tag.toLowerCase();
    return !ALLOWED_MODAL_TAGS.includes(lower) &&
      Object.values(tagsMap).some(subs => subs.includes(lower));
  }) || [];

  return (
    <div
      className="modal-overlay"
      style={styles.overlay}
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}
    >
      <div
        className="modal-animate-in"
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={styles.close} onClick={onClose}>❌</button>

        <div style={styles.header}>
          {tool['Logo URL'] && <img src={tool['Logo URL']} alt={tool.Company} style={styles.logo} />}
          {tool.Tool && <h2 style={styles.title}>{tool.Tool}</h2>}
          {tool.Company && (
            <p style={styles.subtitle}>
              {tool.tags?.some(t => t.toLowerCase() === 'featured') && <span style={styles.star}>⭐ </span>}
              {tool.Company}
            </p>
          )}

          {allowedTags.length > 0 && (
            <div style={styles.tagContainer}>
              {allowedTags.map((tag, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTagClick(tag);
                  }}
                  style={styles.tagPill}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          )}

          {secondaryTags.length > 0 && (
            <>
              <hr style={styles.hr} />
              <div style={styles.tagContainer}>
                {secondaryTags.map((tag, i) => (
                  <span key={i} style={styles.subPill}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </>
          )}

          {tool.Website && (
            <a href={tool.Website} target="_blank" rel="noreferrer" style={styles.visitBtn}>
              Visit →
            </a>
          )}

          <div style={styles.socialContainer}>
            {['Instagram', 'X', 'LinkedIn'].map((platform) => (
              tool[platform] && (
                <a
                  key={platform}
                  href={`https://${tool[platform]}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.socialLink}
                >
                  <img src={socialIcons[platform]} alt={platform} style={styles.socialIcon} />
                </a>
              )
            ))}
          </div>
        </div>

        {tool['YouTube Tutorial'] && renderYouTubeEmbed(tool['YouTube Tutorial'])}

        {(tool.Description || tool['Function / Use']) && (
          <div style={styles.aboutSection}>
            <h3 style={styles.sectionTitle}>About the Tool</h3>
            <p style={styles.aboutText}>
              {tool.Description || tool['Function / Use']}
            </p>
          </div>
        )}

        {tool['Company Profile Link'] && (
          <a href={tool['Company Profile Link']} target="_blank" rel="noreferrer" style={styles.profileBtn}>
            Go to Company Profile
          </a>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    overflow: 'auto',
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    maxWidth: 600,
    width: '100%',
    position: 'relative',
    boxSizing: 'border-box',
    animation: 'fadeIn 0.3s ease',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 18,
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  logo: {
    maxHeight: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: '1.7rem',
    margin: 0,
  },
  star: {
    color: '#ffc107',
    marginRight: 4,
  },
  subtitle: {
    color: '#555',
    marginTop: 8,
    fontSize: '1rem',
  },
  tagContainer: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tagPill: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: 999,
    background: '#f0f0f0',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  subPill: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: 999,
    background: '#fff',
    border: '1px solid #ccc',
    color: '#000',
    cursor: 'default',
    opacity: 0.8,
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #ccc',
    margin: '16px 0 8px',
  },
  visitBtn: {
    display: 'inline-block',
    marginTop: 16,
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 16,
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialLink: {
    display: 'inline-block',
  },
  aboutSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aboutText: {
    color: '#333',
    lineHeight: 1.5,
  },
  profileBtn: {
    marginTop: 24,
    display: 'inline-block',
    padding: '10px 18px',
    border: '2px solid #000',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 'bold',
    color: '#000',
  },
};
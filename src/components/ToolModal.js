import React, { useEffect } from 'react';

export default function ToolModal({ tool, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
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
        height="240"
        src={`https://www.youtube.com/embed/${id}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ marginTop: '12px', borderRadius: '8px' }}
      />
    );
  };

  return (
    <div className="modal-overlay" style={styles.overlay} onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div style={styles.content}>
        <button style={styles.close} onClick={onClose}>❌</button>

        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {tool['Logo URL'] && <img src={tool['Logo URL']} alt={tool.Company} style={styles.logo} />}
          <h2 style={styles.title}>{tool.Company}</h2>
        </div>

        {tool['Function / Use'] && <p style={styles.desc}>{tool['Function / Use']}</p>}

        {tool.Website && (
          <a href={tool.Website} target="_blank" rel="noreferrer" style={styles.link}>
            Visit Website →
          </a>
        )}

        {tool['Tutorial YouTube'] && (
          <>
            <h4 style={styles.heading}>Tutorial:</h4>
            {renderYouTubeEmbed(tool['Tutorial YouTube'])}
          </>
        )}

        {tool['Example Project YouTube'] && (
          <>
            <h4 style={styles.heading}>Example Project:</h4>
            {renderYouTubeEmbed(tool['Example Project YouTube'])}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    overflow: 'auto',
  },
  content: {
    background: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    boxSizing: 'border-box',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 14,
    fontSize: '1.2rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },
  logo: {
    maxWidth: 50,
    marginBottom: 10
  },
  title: {
    fontSize: '1.3rem',
    margin: 0
  },
  desc: {
    marginBottom: 12,
    color: '#333'
  },
  link: {
    color: '#2970ff',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: 20
  },
  heading: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: '0.95rem'
  }
};
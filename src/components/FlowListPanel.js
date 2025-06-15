import React, { useState } from 'react';
import SearchControls from './SearchControls';

function toYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('youtu')) return null;
    const vParam = u.searchParams.get('v');
    if (vParam) return `https://www.youtube.com/embed/${vParam}`;
    const segments = u.pathname.split('/');
    const id = segments[segments.length - 1] || '';
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch (err) {
    return null;
  }
}

function FlowListPanel({ flows = [], onSelect }) {
  const [infoFlow, setInfoFlow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSuggestionClick = (sug) => setSearchQuery(sug);
  const handleClear = () => setSearchQuery('');

  const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const matchCount = (text) => keywords.reduce((acc, k) => acc + (text.toLowerCase().includes(k) ? 1 : 0), 0);

  let green = [], yellow = [], grey = [];

  if (searchQuery) {
    flows.forEach(flow => {
      const count = matchCount(flow.title);
      if (count >= 2) green.push({ ...flow, relevance: 'green' });
      else if (count === 1) yellow.push({ ...flow, relevance: 'yellow' });
      else grey.push({ ...flow, relevance: 'grey' });
    });
  } else {
    flows.forEach(flow => {
      if (flow.relevance === 'green') green.push(flow);
      else if (flow.relevance === 'yellow') yellow.push(flow);
      else grey.push(flow);
    });
  }

  const greenTitles = new Set(green.map(f => f.title));
  const yellowTitles = new Set(yellow.map(f => f.title));
  grey = grey.filter(f => !greenTitles.has(f.title) && !yellowTitles.has(f.title));

  green.sort((a, b) => a.title.localeCompare(b.title));
  yellow.sort((a, b) => a.title.localeCompare(b.title));
  grey.sort((a, b) => a.title.localeCompare(b.title));

  const flowColor = (rev) => rev === 'green' ? '#ccffcc' : rev === 'yellow' ? '#fffcc9' : '#f4f4f4';

  const renderProgress = (flow) => {
    if (!flow.matchedStepCount) return null;
    const pct = Math.round(flow.matchRatio * 100);
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '0.85rem', color: '#333', marginBottom: '6px', textAlign: 'left' }}>
          {flow.matchedStepCount} / {flow.steps.length} steps matched
        </div>
        <div style={{ height: '6px', background: '#eee', borderRadius: '4px', position: 'relative' }}>
          <div style={{ width: `${pct}%`, background: '#2196F3', height: '100%', borderRadius: '4px' }} />
        </div>
      </div>
    );
  };

  const renderStepsList = (flow) => {
    if (!flow?.steps?.length) return null;
    return (
      <ul style={{ marginTop: '8px', marginLeft: '16px', textAlign: 'left' }}>
        {flow.steps.map((step, i) => {
          const firstTool = step.tools?.[0] || '???';
          return (
            <li key={i} style={{ marginBottom: '6px' }}>
              Step {i + 1}: {firstTool} <strong>({step.input} → {step.output})</strong>
            </li>
          );
        })}
      </ul>
    );
  };

  const FlowItem = (f) => {
    const isOpen = infoFlow && infoFlow.title === f.title;
    return (
      <div key={f.title} style={{ border: '1px solid #ddd', borderRadius: '8px', background: flowColor(f.relevance), padding: '10px 12px', marginBottom: '10px', textAlign: 'left', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <button onClick={() => onSelect(f.title)} style={{ background: 'none', border: 'none', cursor: 'pointer', flex: 1, textAlign: 'left', fontSize: '0.95rem', padding: 0, marginRight: '8px' }}>{f.title}</button>
          <button onClick={() => setInfoFlow((prev) => (prev && prev.title === f.title ? null : f))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '0.9rem', marginTop: '-2px' }} title="More Info">ℹ️</button>
        </div>
        {renderProgress(f)}
        {isOpen && (
          <div style={{ marginTop: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '6px', padding: '8px', fontSize: '0.85rem', position: 'relative' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Details:</div>
            {f.description && <div style={{ marginBottom: '8px', lineHeight: '1.4' }}>{f.description}</div>}
            {renderStepsList(f)}
            {f.youtube && (() => {
              const embedUrl = toYouTubeEmbed(f.youtube);
              return embedUrl ? (
                <iframe key="youtube" width="100%" height="200" src={embedUrl} frameBorder="0" style={{ marginTop: '10px', borderRadius: '8px' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`video-${f.title}`} />
              ) : null;
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ textAlign: 'left', transition: 'height 0.3s ease', overflow: 'hidden' }}>
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        style={{
          marginBottom: '12px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: '1px solid #ccc',
          background: isMinimized ? '#eee' : '#ddd',
          width: '100%'
        }}
      >
        {isMinimized ? '➕ Show Flocharts' : '➖ Hide Flocharts'}
      </button>

      <div style={{ display: isMinimized ? 'none' : 'block' }}>
        <SearchControls
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          suggestions={[]}
          handleSuggestionClick={handleSuggestionClick}
          handleClear={handleClear}
          handleExport={null}
          overrideClearLabel="CLEAR SEARCH"
        />

        <h3 style={{ fontWeight: 'bold', fontSize: '1.05rem', margin: '16px 0 12px' }}>➡️ FLOCHARTS</h3>

        {green.length > 0 && (
          <>
            <h4 style={{ marginBottom: '4px', marginTop: '10px' }}>✅ Matches</h4>
            {green.map(FlowItem)}
          </>
        )}

        {yellow.length > 0 && (
          <>
            <h4 style={{ marginBottom: '4px', marginTop: '10px' }}>💡 Related</h4>
            {yellow.map(FlowItem)}
          </>
        )}

        {grey.length > 0 && (
          <>
            <h4 style={{ marginBottom: '4px', marginTop: '10px' }}>📎 Other</h4>
            {grey.map(FlowItem)}
          </>
        )}
      </div>
    </div>
  );
}

export default FlowListPanel;
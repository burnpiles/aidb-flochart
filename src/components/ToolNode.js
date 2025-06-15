import React from 'react';
import { Handle, Position } from 'reactflow';

const StepLabel = ({ text = '' }) => {
  if (!text) return null;
  return (
    <div style={styles.label}>
      {text.split('\n').map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </div>
  );
};

export default function ToolNode({ data }) {
  if (!data) return null;

  const { toolName, toolData = {}, background = '#ffffff', stepLabel = '', onClick } = data;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div style={styles.wrapper}>
      <StepLabel text={stepLabel} />

      <div style={{ ...styles.nodeBox, background }} onClick={() => onClick?.(toolName)}>
        {!isMobile && (
          <>
            <Handle type="target" position={Position.Left} style={styles.handle} />
            <Handle type="source" position={Position.Right} style={styles.handle} />
          </>
        )}

        <div style={styles.content}>
          {toolData['Logo URL'] && (
            <img
              src={toolData['Logo URL']}
              alt={toolName}
              style={styles.logo}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <strong style={styles.title}>{toolName}</strong>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'auto',
    position: 'relative',
  },
  label: {
    marginBottom: 4,
    fontSize: '0.75rem',
    color: '#333',
    textAlign: 'center',
  },
  nodeBox: {
    width: 200,
    height: 50,
    boxSizing: 'border-box',
    borderRadius: 8,
    border: '1px solid #bbb',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    position: 'relative',
  },
  handle: {
    width: 10,
    height: 10,
    background: 'transparent',
    border: 'none',
    pointerEvents: 'none',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logo: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: '1rem',
  },
};
// src/components/FlowStepPanel.js
import React from 'react';

export default function FlowStepPanel({
  flowTemplates = [],
  currentTemplate = 0,
  setCurrentTemplate,
  selectedTools = [],
  handleToolChange = () => {},
  showOnlyFlowTools = false,
  onBackToAllFlows = () => {},
  onTakeScreenshot = () => {}
}) {
  const template = flowTemplates[currentTemplate] || {};
  const { title, steps = [] } = template;

  return (
    <div>
      <h2 style={{ marginBottom: 10 }}>{title}</h2>
      
      <button
        onClick={onTakeScreenshot}
        style={{
          marginBottom: 20,
          padding: '10px 16px',
          backgroundColor: '#f55f4e',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        📸 Take Screenshot
      </button>

      {steps.map((step, idx) => (
        <div key={idx} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 4 }}>
            Step {idx + 1}: {step.input} → {step.output}
          </div>
          <select
            value={selectedTools[idx] || step.tools[0] || ''}
            onChange={(e) => handleToolChange(e.target.value, idx)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          >
            {(step.tools || []).map(tool => (
              <option key={tool} value={tool}>{tool}</option>
            ))}
          </select>
        </div>
      ))}

      {flowTemplates.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 'bold' }}>Other versions:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {flowTemplates.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTemplate(idx)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: idx === currentTemplate ? '#4a90e2' : '#e0e0e0',
                  color: idx === currentTemplate ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showOnlyFlowTools && (
        <button onClick={onBackToAllFlows} style={{ marginTop: 16, width: '100%' }}>← Back to All Flows</button>
      )}
    </div>
  );
}
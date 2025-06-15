// src/hooks/useFlowTemplates.js
import { useState, useEffect } from 'react';

/**
 * Manages flow template selection and related state (tools, edges, labels).
 * @param {string} activeFlowTitle - The title of the currently selected flow.
 * @param {object} allFlows - All available flows, keyed by category.
 * @returns {object} - Flow templates state and helpers.
 */
export default function useFlowTemplates(activeFlowTitle, allFlows) {
  const [flowTemplates, setFlowTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [selectedTools, setSelectedTools] = useState([]);
  const [connectedToolNames, setConnectedToolNames] = useState([]);
  const [flowEdges, setFlowEdges] = useState([]);
  const [stepLabelsMap, setStepLabelsMap] = useState({});

  // Initialize when activeFlowTitle or allFlows changes
  useEffect(() => {
    if (!activeFlowTitle) {
      setFlowTemplates([]);
      setSelectedTools([]);
      setConnectedToolNames([]);
      setFlowEdges([]);
      setStepLabelsMap({});
      setCurrentTemplate(0);
      return;
    }

    // Find matching flow templates by title
    const matched = Object.values(allFlows)
      .flatMap(arr => arr)
      .filter(f => f.title.toLowerCase() === activeFlowTitle.toLowerCase());

    setFlowTemplates(matched);
    setCurrentTemplate(0);
    if (matched.length === 0) return;

    // Build default tools, edges, and labels
    const steps = matched[0].steps || [];
    const defaultTools = steps.map(s => s.tools?.[0]).filter(Boolean);

    setSelectedTools(defaultTools);
    setConnectedToolNames(defaultTools);

    const edges = defaultTools.slice(0, -1).map((t, i) => ({
      id: `flowChain-${t}-${defaultTools[i+1]}`,
      source: `tool-${t}`,
      target: `tool-${defaultTools[i+1]}`,
      type: 'simplebezier',
      style: { stroke: '#555', strokeWidth: 3 },
      animated: false,
      markerEnd: { type: 'arrowclosed', color: '#555' }
    }));
    setFlowEdges(edges);

    const mapObj = {};
    steps.forEach((st, i) => {
      const tool = defaultTools[i];
      if (!tool) return;
      const key = tool.toLowerCase();
      const line = `Step ${i+1}: ${st.input} → ${st.output}`;
      mapObj[key] = mapObj[key] ? `${mapObj[key]}\n${line}` : line;
    });
    setStepLabelsMap(mapObj);
  }, [activeFlowTitle, allFlows]);

  // Update when template index changes
  useEffect(() => {
    if (flowTemplates.length === 0) return;
    const flow = flowTemplates[currentTemplate];
    if (!flow) return;

    const steps = flow.steps || [];
    const tools = steps.map(s => s.tools?.[0]).filter(Boolean);

    setSelectedTools(tools);
    setConnectedToolNames(tools);

    const edges = tools.slice(0, -1).map((t, i) => ({
      id: `flowChain-${t}-${tools[i+1]}`,
      source: `tool-${t}`,
      target: `tool-${tools[i+1]}`,
      type: 'simplebezier',
      style: { stroke: '#555', strokeWidth: 3 },
      animated: false,
      markerEnd: { type: 'arrowclosed', color: '#555' }
    }));
    setFlowEdges(edges);

    const mapObj = {};
    steps.forEach((st, i) => {
      const tool = tools[i];
      if (!tool) return;
      const key = tool.toLowerCase();
      const line = `Step ${i+1}: ${st.input} → ${st.output}`;
      mapObj[key] = mapObj[key] ? `${mapObj[key]}\n${line}` : line;
    });
    setStepLabelsMap(mapObj);
  }, [currentTemplate, flowTemplates]);

  return {
    flowTemplates,
    currentTemplate,
    setCurrentTemplate,
    selectedTools,
    connectedToolNames,
    flowEdges,
    stepLabelsMap
  };
}

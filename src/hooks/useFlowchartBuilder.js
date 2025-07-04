// src/hooks/useFlowchartBuilder.js
import { useState, useEffect } from 'react';

export default function useFlowchartBuilder(activeFlowTitle, allFlows) {
  const [flowTemplates, setFlowTemplates] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [highlightedTools, setHighlightedTools] = useState([]);
  const [connectedToolNames, setConnectedToolNames] = useState([]);
  const [flowEdges, setFlowEdges] = useState([]);
  const [stepLabelsMap, setStepLabelsMap] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState(0);

  useEffect(() => {
    if (!activeFlowTitle) {
      setFlowTemplates([]);
      setSelectedTools([]);
      setHighlightedTools([]);
      setConnectedToolNames([]);
      setFlowEdges([]);
      setStepLabelsMap({});
      return;
    }

    const matched = Object.values(allFlows || {}).flatMap(x => x)
      .filter(f => f.title.toLowerCase() === activeFlowTitle.toLowerCase());

    setFlowTemplates(matched);
    if (!matched.length) return;

    const steps = matched[0].steps || [];
    const defaultTools = steps.map(s => s.tools[0]).filter(Boolean);
    setSelectedTools(defaultTools);
    setHighlightedTools(defaultTools);
    setConnectedToolNames(defaultTools);

    const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];
    const chain = [];

    if (defaultTools.length > 0) {
      chain.push({
        id: 'entry-edge',
        source: 'entry-node',
        target: `tool-${defaultTools[0]}`,
        type: 'step',
        style: { stroke: colors[0], strokeWidth: 3 },
        animated: false,
        markerEnd: { type: 'arrowclosed', color: colors[0] }
      });
    }

    for (let i = 0; i < defaultTools.length - 1; i++) {
      const color = colors[(i + 1) % colors.length];
      chain.push({
        id: `flowChain-${defaultTools[i]}-${defaultTools[i+1]}`,
        source: `tool-${defaultTools[i]}`,
        target: `tool-${defaultTools[i+1]}`,
        type: 'step',
        style: { stroke: color, strokeWidth: 3 },
        animated: false,
        markerEnd: { type: 'arrowclosed', color: color }
      });
    }
    setFlowEdges(chain);

    const mapObj = {};
    steps.forEach((st, idx) => {
      const tool = defaultTools[idx];
      if (!tool) return;
      const key = tool.toLowerCase();
      const line = `Step ${idx+1}: ${st.input} → ${st.output}`;
      mapObj[key] = mapObj[key] ? `${mapObj[key]}\n${line}` : line;
    });
    setStepLabelsMap(mapObj);
  }, [activeFlowTitle, allFlows]);

  function handleToolChange(tool, idx) {
    const arr = [...selectedTools];
    arr[idx] = tool;
    setSelectedTools(arr);
    setHighlightedTools(arr);
    setConnectedToolNames(arr);

    const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];
    const chain = [];

    if (arr.length > 0) {
      chain.push({
        id: 'entry-edge',
        source: 'entry-node',
        target: `tool-${arr[0]}`,
        type: 'step',
        style: { stroke: colors[0], strokeWidth: 3 },
        animated: false,
        markerEnd: { type: 'arrowclosed', color: colors[0] }
      });
    }

    const newChain = arr.slice(0, -1).map((t, i) => {
      const color = colors[(i + 1) % colors.length];
      return {
        id: `flowChain-${t}-${arr[i+1]}`,
        source: `tool-${t}`,
        target: `tool-${arr[i+1]}`,
        type: 'step',
        style: { stroke: color, strokeWidth: 3 },
        animated: false,
        markerEnd: { type: 'arrowclosed', color: color }
      };
    });
    setFlowEdges([...chain, ...newChain]);

    if (flowTemplates.length) {
      const flow = flowTemplates[currentTemplate];
      const newMap = {};
      flow.steps.forEach((st, sIdx) => {
        const chosen = arr[sIdx] || st.tools[0];
        if (!chosen) return;
        const key = chosen.toLowerCase();
        const line = `Step ${sIdx+1}: ${st.input} → ${st.output}`;
        newMap[key] = newMap[key] ? `${newMap[key]}\n${line}` : line;
      });
      setStepLabelsMap(newMap);
    }
  }

  return {
    flowTemplates,
    selectedTools,
    highlightedTools,
    connectedToolNames,
    flowEdges,
    stepLabelsMap,
    currentTemplate,
    setCurrentTemplate,
    handleToolChange
  };
}
// src/components/FlowChartCanvas.js
import React, { useEffect, useState, useRef } from 'react';
import { ReactFlow, Controls, Background } from 'reactflow';
import ToolNode from './ToolNode';
import { generateToolNodes } from '../utils/generateToolNodes';
import { generateFlowEdges } from '../utils/generateFlowEdges';

export default function FlowChartCanvas({
  toolsData,
  tagsData,
  selectedCategories,
  selectedSubcategories,
  highlightedTools,
  selectedTools,
  connectedToolNames,
  suggestedTools,
  stepLabelsMap,
  showOnlyFlowTools = false
}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const wrapperRef = useRef(null);
  const reactFlowInstance = useRef(null);

  const layoutNodes = (nodeList) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return nodeList;

    const padding = 24;
    const minGap = 16;
    const nodeWidth = 200;
    const nodeHeight = 40;
    const usableWidth = wrapper.offsetWidth - padding * 2;
    const columns = Math.max(1, Math.floor(usableWidth / (nodeWidth + minGap)));
    const gap = columns > 1 ? (usableWidth - columns * nodeWidth) / (columns - 1) : 0;

    return nodeList.map((node, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      return {
        ...node,
        position: {
          x: padding + col * (nodeWidth + gap),
          y: padding + row * 80
        }
      };
    });
  };

  const generate = () => {
    const newNodes = generateToolNodes({
      toolsData,
      tagsData,
      selectedCategories,
      selectedSubcategories,
      highlightedTools,
      selectedTools,
      connectedToolNames,
      suggestedTools,
      showOnlyFlowTools,
      stepLabelsMap
    });
    const laidOut = layoutNodes(newNodes);
    const newEdges = generateFlowEdges(laidOut, selectedTools);
    setNodes(laidOut);
    setEdges(newEdges);
  };

  useEffect(() => {
    generate();
    const handleResize = () => {
      clearTimeout(window.__resizeTimer);
      window.__resizeTimer = setTimeout(generate, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [
    toolsData,
    tagsData,
    selectedCategories,
    selectedSubcategories,
    highlightedTools,
    selectedTools,
    connectedToolNames,
    suggestedTools,
    showOnlyFlowTools,
    stepLabelsMap
  ]);

  return (
    <>
      <div style={{ textAlign: 'center', margin: '4px 0', fontSize: '0.75rem', color: '#555' }}>
        🔴 Input   🟢 Output
      </div>

      <div
        ref={wrapperRef}
        className="react-flow-wrapper"
        style={{
          width: '100vw',
          height: 'calc(100vh - 100px)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          paddingTop: '16px'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
            setTimeout(() => instance.setViewport({ x: 0, y: 0, zoom: 1 }), 50);
          }}
          fitView={false}
          nodeTypes={{ tool: ToolNode }}
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </>
  );
}
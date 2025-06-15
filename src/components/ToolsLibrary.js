// src/components/ToolsLibrary.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

import FlowStepPanel from './FlowStepPanel';
import FlowListPanel from './FlowListPanel';
import BuildSelector from './BuildSelector';
import ToolNode from './ToolNode';
import ToolModal from './ToolModal';
import LegendBar from './LegendBar';

import { generateToolNodes } from '../utils/generateToolNodes';
import { generateUserEdges } from '../utils/generateEdges';
import { reorderNodesWithFlowMode } from '../utils/layoutUtils';
import useAutoCenterFlow from '../hooks/useAutoCenterFlow';
import useFlowchartBuilder from '../hooks/useFlowchartBuilder';

const nodeTypes = { tool: ToolNode };

function ToolsLibraryContent() {
  const containerRef = useRef(null);
  const reactFlowWrapperRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const buildSelectorRef = useRef(null);

  const [toolsData, setToolsData] = useState({});
  const [allFlows, setAllFlows] = useState({});
  const [tagsData, setTagsData] = useState({});

  const [nodes, setNodes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMatchMode, setTagMatchMode] = useState('some');
  const [activeFlowTitle, setActiveFlowTitle] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const {
    flowTemplates,
    selectedTools,
    highlightedTools,
    connectedToolNames,
    flowEdges,
    stepLabelsMap,
    currentTemplate,
    setCurrentTemplate,
    handleToolChange
  } = useFlowchartBuilder(activeFlowTitle, allFlows);

  useAutoCenterFlow(reactFlowInstanceRef, [nodes, flowEdges]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/Tools.json').then(r => r.json()),
      fetch('/FlowChart-Results.json').then(r => r.json()),
      fetch('/tags.json').then(r => r.json())
    ]).then(([td, flows, tags]) => {
      setToolsData(td);
      setAllFlows(flows);
      setTagsData(tags);
    });
  }, []);

  const allEdges = generateUserEdges(flowEdges);

  const filteredFlows = useMemo(() => {
    const arr = Object.values(allFlows).flatMap(x => x);
    const catLC = selectedCategory?.toLowerCase();
    const subLC = selectedSubcategory?.toLowerCase();
    return arr.map(f => {
      const tagsLC = (f.tags || []).map(t => t.toLowerCase());
      let relevance = 'grey';
      if (subLC && tagsLC.includes(subLC)) relevance = 'green';
      else if (catLC && tagsLC.includes(catLC)) relevance = subLC ? 'yellow' : 'green';
      return { ...f, relevance };
    });
  }, [allFlows, selectedCategory, selectedSubcategory]);

  function handleNodeClick(name) {
    const tool = toolsData[name];
    if (tool) setActiveTool(tool);
  }

  function resetFlowchartState() {
    setSelectedTags([]);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setTagMatchMode('some');
    setActiveFlowTitle('');
    setCurrentTemplate(0);
    buildSelectorRef.current?.reset();
  }

  async function handleExport() {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current);
      const link = document.createElement('a');
      link.download = 'flowhart_ai_screenshot.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
    }
  }

  const showOnlyFlowTools = !isMobile;

  const mobileNodes = useMemo(() => {
    if (!Object.keys(toolsData).length || !Object.keys(tagsData).length) return [];
    const newNodes = generateToolNodes({
      toolsData,
      tagsData,
      selectedCategories: selectedCategory ? [selectedCategory] : [],
      selectedSubcategories: selectedSubcategory ? [selectedSubcategory] : [],
      highlightedTools: selectedTags,
      selectedTools,
      showOnlyFlowTools,
      connectedToolNames,
      suggestedTools: [],
      matchMode: tagMatchMode,
      isMobile,
      stepLabelsMap
    });
    const sorted = [...newNodes].sort((a, b) => {
      const prio = { green: 0, yellow: 1, grey: 2 };
      const aPri = prio[a.data.relevance] ?? 3;
      const bPri = prio[b.data.relevance] ?? 3;
      if (aPri !== bPri) return aPri - bPri;
      return (a.data.toolName || '').localeCompare(b.data.toolName || '');
    });
    return reorderNodesWithFlowMode(sorted, selectedTools);
  }, [toolsData, tagsData, selectedCategory, selectedSubcategory, selectedTags, selectedTools, connectedToolNames, tagMatchMode, isMobile, stepLabelsMap]);

  useEffect(() => {
    setNodes(mobileNodes);
  }, [mobileNodes]);

  return (
    <div
      ref={containerRef}
      className="tools-layout"
      style={{ display: 'flex', width: '100vw', height: '100vh', position: 'relative', backgroundColor: 'white', overflowX: 'hidden' }}
    >
      <div
        style={{
          width: isMobile ? '100vw' : 280,
          maxWidth: isMobile ? '100vw' : 400,
          backgroundColor: '#2e2e2e',
          color: '#fff',
          padding: 16,
          boxSizing: 'border-box'
        }}
      >
        <BuildSelector
          ref={buildSelectorRef}
          heading="Choose your project type"
          onFilterChange={(cat, sub) => {
            fetch('/tags.json').then(r => r.json()).then(data => {
              setSelectedCategory(cat);
              setSelectedSubcategory(sub);
              if (!cat) {
                setSelectedTags([]);
                setTagMatchMode('some');
                return;
              }
              const base = cat.toLowerCase();
              if (sub) {
                setSelectedTags([sub.toLowerCase()]);
                setTagMatchMode('every');
              } else {
                const arr = data[base] || [];
                setSelectedTags([base, ...arr.map(t => t.toLowerCase())]);
                setTagMatchMode('some');
              }
              const el = document.getElementById('tools-anchor');
              if (isMobile && el) el.scrollIntoView({ behavior: 'smooth' });
            });
          }}
        />

        <button
          onClick={resetFlowchartState}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '14px',
            backgroundColor: '#f5c542',
            color: '#333',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: 12
          }}
        >
          🧹 Clear Filters
        </button>

        <a href="https://www.burnpiles.com/" target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 12, color: '#f0f0f0', textDecoration: 'none' }}>
          🔥 Burnpiles
        </a>
      </div>

      <div
        style={{ width: isMobile ? '100%' : 320, padding: 10, backgroundColor: '#fafafa', overflowY: 'auto' }}
      >
        {flowTemplates.length ? (
          <FlowStepPanel
            flowTemplates={flowTemplates}
            currentTemplate={currentTemplate}
            setCurrentTemplate={setCurrentTemplate}
            selectedTools={selectedTools}
            handleToolChange={handleToolChange}
            showOnlyFlowTools={showOnlyFlowTools}
            onBackToAllFlows={() => {
              setCurrentTemplate(0);
              setActiveFlowTitle('');
            }}
            onTakeScreenshot={handleExport} // Added prop here
          />
        ) : (
          !isMobile && (
            <FlowListPanel
              flows={filteredFlows}
              onSelect={title => {
                const found = Object.values(allFlows).flatMap(x => x).find(f => f.title.toLowerCase() === title.toLowerCase());
                if (found) setActiveFlowTitle(found.title);
              }}
            />
          )
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!isMobile && <LegendBar />}
        <div ref={reactFlowWrapperRef} style={{ flex: 1, position: 'relative' }}>
          {!isMobile ? (
            <ReactFlow
              onInit={inst => (reactFlowInstanceRef.current = inst)}
              nodes={nodes.map(n => ({ ...n, data: { ...n.data, onClick: handleNodeClick } }))}
              edges={allEdges}
              connectionLineType="simplebezier"
              nodeTypes={nodeTypes}
            />
          ) : (
            <div
              id="tools-anchor"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                scrollMarginTop: '80px',
                minHeight: '400px'
              }}
            >
              <div style={{ width: '100%', backgroundColor: '#fff3cd', padding: 10, textAlign: 'center', fontWeight: 'bold', color: '#a94442' }}>
                🚨 Use Desktop Site To See Flocharts 🚨
              </div>
              {nodes
                .filter(n => !n.hidden)
                .map(n => (
                  <ToolNode key={n.id || n.data.toolName} data={{ ...n.data, onClick: handleNodeClick }} />
                ))}
            </div>
          )}
        </div>
      </div>

      {activeTool && <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  );
}

export default function ToolsLibrary() {
  return (
    <ReactFlowProvider>
      <ToolsLibraryContent />
    </ReactFlowProvider>
  );
}
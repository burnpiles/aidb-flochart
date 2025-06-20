import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import domtoimage from 'dom-to-image-more';

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
import { useFilters } from '../hooks/FilterContext';

const nodeTypes = { tool: ToolNode };

function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (ref.current) {
        setWidth(ref.current.getBoundingClientRect().width);
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, [ref]);

  return width;
}

function ToolsLibraryContent() {
  const containerRef = useRef(null);
  const reactFlowWrapperRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const buildSelectorRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [toolsData, setToolsData] = useState({});
  const [allFlows, setAllFlows] = useState({});
  const [tagsData, setTagsData] = useState({});
  const [nodes, setNodes] = useState([]);
  const [activeFlowTitle, setActiveFlowTitle] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const {
    selectedCategory,
    selectedSubcategory,
    highlightedTools,
    tagMatchMode,
    clearFilters,
    applyCategoryFilter
  } = useFilters();

  const {
    flowTemplates,
    selectedTools,
    connectedToolNames,
    flowEdges,
    stepLabelsMap,
    currentTemplate,
    setCurrentTemplate,
    handleToolChange
  } = useFlowchartBuilder(activeFlowTitle, allFlows);

  useAutoCenterFlow(reactFlowInstanceRef, [nodes, flowEdges, isPanelCollapsed]);

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

  const finalFilteredFlows = useMemo(() => {
    const flowsToFilter = filteredFlows;
    if (!searchQuery) {
      return flowsToFilter;
    }
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const matchCount = (text) => keywords.reduce((acc, k) => acc + (text.toLowerCase().includes(k) ? 1 : 0), 0);

    return flowsToFilter.map(flow => {
      const count = matchCount(flow.title);
      if (count >= 2) return { ...flow, relevance: 'green' };
      if (count === 1) return { ...flow, relevance: 'yellow' };
      return { ...flow, relevance: 'grey' };
    });
  }, [searchQuery, filteredFlows]);

  const flowListRelevance = useMemo(() => {
    if (!finalFilteredFlows || finalFilteredFlows.length === 0) return 'default';
    if (finalFilteredFlows.some(f => f.relevance === 'green')) return 'green';
    if (finalFilteredFlows.some(f => f.relevance === 'yellow')) return 'yellow';
    return 'default';
  }, [finalFilteredFlows]);

  function handleNodeClick(name) {
    const tool = toolsData[name];
    if (tool) setActiveTool({ ...tool, __toolName: name });
  }

  const containerWidth = useContainerWidth(reactFlowWrapperRef);
  const showOnlyFlowTools = !isMobile;

  const mobileNodes = useMemo(() => {
    if (!Object.keys(toolsData).length || !Object.keys(tagsData).length) return [];

    const newNodes = generateToolNodes({
      toolsData,
      tagsData,
      selectedCategories: selectedCategory ? [selectedCategory] : [],
      selectedSubcategories: selectedSubcategory ? [selectedSubcategory] : [],
      highlightedTools,
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
      const aPri = prio[a.style?.background] ?? 3;
      const bPri = prio[b.style?.background] ?? 3;
      if (aPri !== bPri) return aPri - bPri;
      return (a.data.toolName || '').localeCompare(b.data.toolName || '');
    });

    return reorderNodesWithFlowMode(sorted, selectedTools, containerWidth);
  }, [
    toolsData,
    tagsData,
    selectedCategory,
    selectedSubcategory,
    selectedTools,
    connectedToolNames,
    tagMatchMode,
    isMobile,
    stepLabelsMap,
    highlightedTools,
    showOnlyFlowTools,
    containerWidth
  ]);

  useEffect(() => {
    setNodes(mobileNodes);
  }, [mobileNodes]);

  const showLegendBar = useMemo(() => {
    return flowTemplates.length > 0;
  }, [flowTemplates.length]);

  const isResetActive = useMemo(() => {
    return selectedCategory || selectedSubcategory || flowTemplates.length > 0 || searchQuery;
  }, [selectedCategory, selectedSubcategory, flowTemplates.length, searchQuery]);

  async function handleExport() {
    if (!containerRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(containerRef.current, {
        bgcolor: '#ffffff',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = 'flochart_ai_screenshot.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
    }
  }

  return (
    <div
      ref={containerRef}
      className="tools-layout"
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: 'white',
        overflowX: 'hidden'
      }}
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
          isFlowchartActive={flowTemplates.length > 0}
          onFilterChange={(cat, sub) => {
            fetch('/tags.json').then(r => r.json()).then(data => {
              applyCategoryFilter(cat, sub, data);
              setCurrentTemplate(0);
              setActiveFlowTitle('');
              if (isMobile) {
                const el = document.getElementById('tools-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            });
          }}
        />

        <button
          onClick={() => {
            if (!isResetActive) return;
            clearFilters();
            setSearchQuery('');
            buildSelectorRef.current?.reset();
            setCurrentTemplate(0);
            setActiveFlowTitle('');
          }}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '14px',
            backgroundColor: isResetActive ? '#f5c542' : '#808080',
            color: isResetActive ? '#333' : '#a9a9a9',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: 12,
            cursor: isResetActive ? 'pointer' : 'not-allowed'
          }}
        >
          RESET
        </button>

        <a
          href="https://www.burnpiles.com/"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'block', marginTop: 12, color: '#f0f0f0', textDecoration: 'none' }}
        >
          🔥 Burnpiles
        </a>
      </div>

      <div style={{ position: 'relative', backgroundColor: '#fafafa', display: 'flex' }}>
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          style={{
            height: '100%',
            border: 'none',
            background: !isPanelCollapsed ? '#aed6f1' : flowListRelevance === 'green' ? '#ccffcc' : flowListRelevance === 'yellow' ? '#fffcc9' : '#aed6f1',
            color: '#333',
            cursor: 'pointer',
            padding: '0 8px',
            fontSize: '1rem',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            textAlign: 'center'
          }}
        >
          {isPanelCollapsed ? 'Show Flocharts' : 'Hide Flocharts'}
        </button>
        <div style={{ width: isPanelCollapsed ? 0 : (isMobile ? '100%' : 320), padding: isPanelCollapsed ? 0 : 10, overflowY: 'auto', transition: 'width 0.3s ease, padding 0.3s ease' }}>
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
              onTakeScreenshot={handleExport}
            />
          ) : (
            !isMobile && (
              <FlowListPanel
                flows={finalFilteredFlows}
                searchQuery={searchQuery}
                onSearchChange={(q) => setSearchQuery(q)}
                onSelect={(title) => {
                  const found = Object.values(allFlows).flatMap(x => x).find(f => f.title.toLowerCase() === title.toLowerCase());
                  if (found) setActiveFlowTitle(found.title);
                }}
              />
            )
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!isMobile && showLegendBar && <LegendBar onExport={handleExport} />}
        <div ref={reactFlowWrapperRef} style={{ flex: 1, position: 'relative' }}>
          {!isMobile ? (
            <ReactFlow
              onInit={(inst) => (reactFlowInstanceRef.current = inst)}
              nodes={nodes.map((n) => ({ ...n, data: { ...n.data, onClick: handleNodeClick } }))}
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
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#fff3cd',
                  padding: 10,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#a94442'
                }}
              >
                🚨 Desktop View Recommended 🚨
              </div>
              {nodes.filter(n => !n.hidden).map(n => (
                <ToolNode key={n.id || n.data.toolName} data={{ ...n.data, onClick: handleNodeClick }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {activeTool && (
        <ToolModal
          tool={activeTool}
          onClose={() => setActiveTool(null)}
        />
      )}
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
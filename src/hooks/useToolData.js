import { useEffect, useState } from 'react';

const useToolData = () => {
  const [tools, setTools] = useState({});
  const [flows, setFlows] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/Tools.json').then((res) => res.json()),
      fetch('/FlowChart-Results.json').then((res) => res.json()),
      fetch('/tags.json').then((res) => res.json())
    ])
      .then(([toolData, flowData, tagData]) => {
        setTools(toolData);
        setFlows(flowData);
        setTags(tagData);
        setLoading(false);
      });
  }, []);

  const buildSuggestions = () => {
    const allTags = Object.values(tools).flatMap(t => t.tags || []);
    const uniqueTags = [...new Set(allTags.map(t => t.toLowerCase()))];
    return uniqueTags;
  };

  return {
    tools,
    flows,
    tags,
    loading,
    suggestions: buildSuggestions()
  };
};

export default useToolData;

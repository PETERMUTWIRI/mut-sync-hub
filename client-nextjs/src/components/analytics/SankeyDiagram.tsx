import React from 'react';
import { Sankey, ResponsiveContainer, Tooltip } from 'recharts';

interface Node {
  id: string;
  name: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: Node[];
  links: Link[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const link = payload[0].payload;
    return (
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <p className="text-white">{`${link.sourceName} → ${link.targetName}`}</p>
        <p className="text-teal-300">{`Value: ${link.value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export default function SankeyDiagram({ data, title }: SankeyDiagramProps) {
  // Create a map of node IDs to their index position
  const nodeIndexMap: Record<string, number> = {};
  data.nodes.forEach((node, index) => {
    nodeIndexMap[node.id] = index;
  });

  // Transform data for Recharts
  const sankeyData = {
    nodes: data.nodes.map(node => ({ name: node.name })),
    links: data.links.map(link => {
      const sourceIndex = nodeIndexMap[link.source] || 0;
      const targetIndex = nodeIndexMap[link.target] || 0;
      
      return {
        source: sourceIndex,
        target: targetIndex,
        value: link.value,
        // Add names for tooltip
        sourceName: data.nodes[sourceIndex]?.name,
        targetName: data.nodes[targetIndex]?.name
      };
    })
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            node={{ 
              fill: '#38bdf8', 
              stroke: '#0c4a6e',
              strokeWidth: 0
            }}
            nodePadding={50}
            link={{ 
              stroke: '#7dd3fc', 
              strokeWidth: 0,
              fill: '#a78bfa',
              fillOpacity: 0.6
            }}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
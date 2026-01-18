'use client';

import { NodeMetrics } from '../types/simulation';

interface FlowMapProps {
  nodes: NodeMetrics[];
}

export default function FlowMap({ nodes }: FlowMapProps) {
  const getNodeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500 animate-pulse';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const nodePositions = {
    arrival: { x: 50, y: 50 },
    triage_queue: { x: 150, y: 50 },
    triage_service: { x: 250, y: 50 },
    ed_queue: { x: 350, y: 50 },
    ed_service: { x: 450, y: 50 },
    imaging_queue: { x: 350, y: 150 },
    imaging_service: { x: 450, y: 150 },
    result_review_queue: { x: 550, y: 150 },
    result_review_service: { x: 650, y: 150 },
    obs: { x: 550, y: 250 },
    or_queue: { x: 250, y: 250 },
    in_or: { x: 350, y: 250 },
    icu_wait: { x: 450, y: 350 },
    icu: { x: 550, y: 350 },
    ward: { x: 650, y: 250 },
    discharge: { x: 750, y: 200 },
    transfer_out: { x: 750, y: 300 },
    elevator_queue: { x: 150, y: 350 },
  };

  return (
    <div className="relative w-full h-full bg-gray-50">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Arrows and connections */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        {/* Draw connections */}
        <line x1="50" y1="50" x2="150" y2="50" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="150" y1="50" x2="250" y2="50" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="50" x2="350" y2="50" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="350" y1="50" x2="450" y2="50" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="450" y1="50" x2="350" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="350" y1="150" x2="450" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="450" y1="150" x2="550" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="550" y1="150" x2="650" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="150" x2="650" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="450" y1="50" x2="250" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="250" x2="350" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="350" y1="250" x2="450" y2="350" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="450" y1="350" x2="550" y2="350" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="550" y1="350" x2="650" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="250" x2="750" y2="200" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="650" y1="250" x2="750" y2="300" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="250" y1="250" x2="150" y2="350" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePositions[node.node as keyof typeof nodePositions];
          if (!pos) return null;
          return (
            <g key={node.node}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="20"
                className={getNodeColor(node.color)}
                fill="currentColor"
              />
              <text
                x={pos.x}
                y={pos.y + 30}
                textAnchor="middle"
                fontSize="10"
                fill="#333"
              >
                {node.node.replace('_', ' ').toUpperCase()}
              </text>
              <text
                x={pos.x}
                y={pos.y - 30}
                textAnchor="middle"
                fontSize="8"
                fill="#333"
              >
                Q:{node.queueLength} U:{node.utilization.toFixed(2)}
              </text>
              <text
                x={pos.x}
                y={pos.y - 40}
                textAnchor="middle"
                fontSize="8"
                fill="#333"
              >
                P95:{node.p95Wait.toFixed(1)} D:{node.deaths}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
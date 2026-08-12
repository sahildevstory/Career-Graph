"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { X } from "lucide-react";

import EntityBadge from "@/components/ui/EntityBadge";

interface GraphNode {
  id: string;
  labels: string[];
  name: string;
  description?: string;
}

interface SelectedNode extends GraphNode {
  neighbors?: Array<{
    relationshipType: string;
    neighbor: GraphNode;
  }>;
}

const nodeTypeColors: Record<string, string> = {
  Skill: "#3b82f6",
  Technology: "#8b5cf6",
  Role: "#10b981",
  Company: "#64748b",
  Project: "#f59e0b",
  Industry: "#ef4444",
};

export default function GraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNodeClick = useCallback(async (nodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/graph/node/${nodeId}`);
      if (!response.ok) throw new Error("Failed to fetch node details");
      const data = await response.json();
      setSelectedNode(data.data);
    } catch (err) {
      console.error("Error fetching node:", err);
      setError("Failed to load node details");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search");
      const data = await response.json();

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      (data.data || []).forEach((item: Record<string, unknown>, index: number) => {
        const labels = (item.label as string[]) || [];
        const nodeColor = nodeTypeColors[labels[0] || "skill"] || "#64748b";
        newNodes.push({
          id: item.id as string,
          data: {
            label: item.name as string,
            type: labels[0] || "node",
          },
          position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 150 },
          style: {
            background: nodeColor,
            color: "#fff",
            border: "2px solid #000",
            borderRadius: "8px",
            padding: "10px",
            fontWeight: 500,
          },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error("Error searching:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, setNodes, setEdges]);

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - Search and Filters */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Explore Graph</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search entities
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Skills, roles, tech..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Go
            </button>
          </div>
        </div>

        {nodes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Nodes ({nodes.length})
            </h3>
            <div className="space-y-2 mb-6">
              {nodes.map((node) => {
                const data = node.data as Record<string, string>;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className="w-full text-left px-3 py-2 rounded border border-slate-200 hover:bg-slate-50 text-sm transition-colors"
                  >
                    <p className="font-medium text-slate-900">{data?.label || node.id}</p>
                    <p className="text-xs text-slate-500">{data?.type || "Node"}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-600 mt-auto">
          <p>💡 Tip: Search for skills, roles, technologies to explore their connections.</p>
        </div>
      </div>

      {/* Center - Graph Canvas */}
      <div className="flex-1 bg-slate-50 relative">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm z-10">
            {error}
          </div>
        )}
        {loading && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-slate-400 border-t-slate-900 rounded-full mx-auto mb-4" />
              <p className="text-slate-600">Loading graph...</p>
            </div>
          </div>
        )}
        {nodes.length > 0 ? (
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-slate-600">
            <div>
              <p className="text-lg font-medium mb-2">Start exploring</p>
              <p className="text-sm">Search for a skill, role, or technology above</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Node Details */}
      {selectedNode && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">{selectedNode.name}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Type */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {selectedNode.labels.map((label) => {
                  const typeMap: Record<string, "skill" | "technology" | "role" | "company" | "project" | "industry"> = {
                    skill: "skill",
                    technology: "technology",
                    role: "role",
                    company: "company",
                    project: "project",
                    industry: "industry",
                  };
                  const type = typeMap[label.toLowerCase()] || "company";
                  return <EntityBadge key={label} type={type} label={label} />;
                })}
              </div>
            </div>

            {/* Description */}
            {selectedNode.description && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-700">{selectedNode.description}</p>
              </div>
            )}

            {/* Connections */}
            {selectedNode.neighbors && selectedNode.neighbors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-3">
                  Connections ({selectedNode.neighbors.length})
                </p>
                <div className="space-y-2">
                  {selectedNode.neighbors.slice(0, 10).map((conn, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        {conn.relationshipType}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {conn.neighbor.name}
                      </p>
                    </div>
                  ))}
                  {selectedNode.neighbors.length > 10 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      +{selectedNode.neighbors.length - 10} more connections
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

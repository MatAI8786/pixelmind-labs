import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, addEdge, useEdgesState, useNodesState } from 'react-flow-renderer';
import { PersonaSelectorNode } from './nodes/PersonaSelectorNode';
import { LLMNode } from './nodes/LLMNode';
import { GateNode } from './nodes/GateNode';
import { AggregatorNode } from './nodes/AggregatorNode';
import { OutputNode } from './nodes/OutputNode';

const nodeTypes = {
  personaSelector: PersonaSelectorNode,
  llmNode: LLMNode,
  gateNode: GateNode,
  aggregatorNode: AggregatorNode,
  outputNode: OutputNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetch('/web_department.json')
      .then(res => res.json())
      .then(data => {
        const nds = data.nodes.map((n: any) => ({
          id: n.id,
          type: mapType(n.type),
          data: n.config,
          position: { x: Math.random() * 400, y: Math.random() * 400 },
        }));
        setNodes(nds);
        const eds: any[] = [];
        data.nodes.forEach((n: any) => {
          if (n.outputs) {
            n.outputs.forEach((o: string) => eds.push({ id: `${n.id}-${o}`, source: n.id, target: o }));
          }
        });
        setEdges(eds);
      });
  }, []);

  const mapType = (t: string) => {
    switch (t) {
      case 'PersonaSelector':
        return 'personaSelector';
      case 'LLMNode':
        return 'llmNode';
      case 'Gate':
        return 'gateNode';
      case 'AggregatorNode':
        return 'aggregatorNode';
      case 'Output':
        return 'outputNode';
      default:
        return undefined;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <div style={{ width: 200, borderRight: '1px solid #ddd', padding: 10 }}>
        <h3>Departments</h3>
        <div>WebDesign</div>
        <h3 style={{ marginTop: 20 }}>Categories</h3>
        <div>📁 Processes</div>
        <div>🌐 Endpoints</div>
        <div>🤖 LLMs</div>
        <h3 style={{ marginTop: 20 }}>Agent Design</h3>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={params => setEdges(eds => addEdge(params, eds))}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

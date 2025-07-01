import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import download from 'downloadjs';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { WorkflowProvider } from '../state/workflowContext';
import LLMNode, { LLMNodeData } from '../components/nodes/LLMNode';
import 'reactflow/dist/style.css';

const ReactFlow = dynamic(() => import('reactflow'), { ssr: false });

const nodeTypes = { llm: LLMNode };

function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<LLMNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { project } = useReactFlow();

  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => addEdge(params, eds)),
  []);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', 'llm');
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!reactFlowWrapper.current || !type) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const newNode: Node<LLMNodeData> = {
        id: crypto.randomUUID(),
        type,
        position,
        data: {
          title: 'LLM',
          prompt: '',
          model: 'gpt-3.5-turbo',
          temperature: 1,
          maxTokens: 256,
          provider: 'openai',
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) as
    | Node<LLMNodeData>
    | undefined;

  const updateNodeData = (id: string, data: Partial<LLMNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    );
  };

  const exportWorkflow = () => {
    download(
      JSON.stringify({ nodes, edges }, null, 2),
      'workflow.json',
      'application/json',
    );
  };

  return (
    <div className="flex h-screen">
        <aside className="w-40 bg-gray-100 p-4 space-y-2">
          <div
            className="cursor-grab p-2 bg-white border rounded text-center"
            onDragStart={onDragStart}
            draggable
          >
            + LLM
          </div>
          <button
            onClick={exportWorkflow}
            className="w-full bg-blue-500 text-white px-2 py-1 rounded"
          >
            Export
          </button>
        </aside>
        <main className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            className="h-full"
          />
          {selectedNode && selectedNode.type === 'llm' && (
            <aside className="absolute right-0 top-0 w-72 h-full bg-white border-l p-4 overflow-y-auto">
              <h2 className="font-bold mb-2">LLM Node</h2>
              <label className="block text-sm">Title</label>
              <input
                className="border w-full mb-2 p-1"
                value={selectedNode.data.title}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { title: e.target.value })
                }
              />
              <label className="block text-sm">Prompt</label>
              <textarea
                className="border w-full mb-2 p-1"
                rows={4}
                value={selectedNode.data.prompt}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { prompt: e.target.value })
                }
              />
              <label className="block text-sm">Model</label>
              <select
                className="border w-full mb-2 p-1"
                value={selectedNode.data.model}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { model: e.target.value })
                }
              >
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4">gpt-4</option>
              </select>
              <label className="block text-sm">Temperature: {selectedNode.data.temperature}</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                className="w-full mb-2"
                value={selectedNode.data.temperature}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    temperature: parseFloat(e.target.value),
                  })
                }
              />
              <label className="block text-sm">Max Tokens</label>
              <input
                type="number"
                className="border w-full mb-2 p-1"
                value={selectedNode.data.maxTokens}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, {
                    maxTokens: parseInt(e.target.value, 10),
                  })
                }
              />
              <label className="block text-sm">Provider</label>
              <select
                className="border w-full mb-2 p-1"
                value={selectedNode.data.provider}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { provider: e.target.value })
                }
              >
                <option value="openai">OpenAI</option>
              </select>
            </aside>
          )}
        </main>
      </div>
    );
}

export default function Home() {
  return (
    <WorkflowProvider>
      <ReactFlowProvider>
        <Head>
          <title>PixelMind Labs</title>
        </Head>
        <FlowBuilder />
      </ReactFlowProvider>
    </WorkflowProvider>
  );
}

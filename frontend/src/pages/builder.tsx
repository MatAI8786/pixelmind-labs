import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import TriggerNode from '../components/nodes/TriggerNode';
import ActionNode from '../components/nodes/ActionNode';
import ConditionNode from '../components/nodes/ConditionNode';
import { useWorkflowStore } from '../state/workflowStore';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

function BuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const { nodes: storeNodes, edges: storeEdges, setNodes: setStoreNodes, setEdges: setStoreEdges } = useWorkflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(storeEdges);
  const [workflowId, setWorkflowId] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => setNodes(storeNodes), [storeNodes]);
  useEffect(() => setEdges(storeEdges), [storeEdges]);
  useEffect(() => setStoreNodes(nodes), [nodes, setStoreNodes]);
  useEffect(() => setStoreEdges(edges), [edges, setStoreEdges]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!reactFlowWrapper.current || !type) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes],
  );

  const saveWorkflow = async () => {
    const res = await fetch(`${baseUrl}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });
    if (res.ok) {
      const data = await res.json();
      setWorkflowId(data.id);
    }
  };

  const openWorkflow = async () => {
    if (!workflowId) return;
    const res = await fetch(`${baseUrl}/api/workflows/${workflowId}`);
    if (res.ok) {
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-40 bg-gray-100 dark:bg-gray-900 p-2 space-y-2 text-black dark:text-white">
        {['trigger', 'action', 'condition'].map((t) => (
          <div
            key={t}
            className="p-2 bg-white dark:bg-gray-700 border rounded dark:border-gray-600 cursor-grab"
            draggable
            onDragStart={(e) => onDragStart(e, t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
        <button onClick={saveWorkflow} className="w-full bg-blue-600 text-white px-2 py-1 rounded">
          Save
        </button>
        <div className="flex space-x-1">
          <input
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="flex-1 px-1 text-black"
            placeholder="id"
          />
          <button onClick={openWorkflow} className="bg-blue-600 text-white px-2 rounded">
            Open
          </button>
        </div>
      </aside>
      <main className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="h-full"
        />
      </main>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <Head>
        <title>Workflow Builder</title>
      </Head>
      <BuilderInner />
    </ReactFlowProvider>
  );
}

import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import LogModal from '../components/LogModal';
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
import { dragNodeFactory } from '../lib/dragNodeFactory';
import TriggerNode from '../components/nodes/TriggerNode';
import ActionNode from '../components/nodes/ActionNode';
import ConditionNode from '../components/nodes/ConditionNode';
import { useWorkflowStore } from '../state/workflowStore';
import toast from 'react-hot-toast';
import { useWorkflowList } from '../hooks/useWorkflowList';
import { useWorkflowListStore } from '../state/workflowListStore';

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [log, setLog] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const { workflows } = useWorkflowList();
  const { add } = useWorkflowListStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setNodes(storeNodes), [storeNodes]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setEdges(storeEdges), [storeEdges]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setStoreNodes(nodes), [nodes, setStoreNodes]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setStoreEdges(edges), [edges, setStoreEdges]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
      const pos = project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      const newNode = dragNodeFactory(type, pos.x, pos.y);
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes],
  );

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const testNode = async () => {
    if (!selectedNode) return;
    try {
      const res = await fetch(`${baseUrl}/api/workflows/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: [selectedNode], edges: [] }),
      });
      const data = await res.json();
      setLog((data.log || []).join('\n'));
      setLogOpen(true);
    } catch (e: any) {
      setLog(e.message);
      setLogOpen(true);
    }
  };

  const saveWorkflow = async () => {
    const name = prompt('Workflow name');
    if (!name) return;
    try {
      const res = await fetch(`${baseUrl}/api/workflows/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nodes, edges }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      setWorkflowId(data.id);
      add({ id: data.id, name });
      toast.success('Workflow saved \u2714');
    } catch (err: any) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const openWorkflow = async () => {
    if (!workflowId) return;
    try {
      const res = await fetch(`${baseUrl}/api/workflows/${workflowId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      toast.success('Workflow loaded');
    } catch (err: any) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Load failed');
    }
  };

  return (
    <div className="flex h-screen">
      <aside
        className="w-40 bg-gray-100 dark:bg-gray-900 p-2 space-y-2 text-black dark:text-white"
        onDragOver={() => false}
      >
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
        <div className="space-y-1">
          <select
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="w-full px-1 text-black"
          >
            <option value="">Select workflow</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name || `Workflow ${w.id}`}
              </option>
            ))}
          </select>
          <button onClick={openWorkflow} className="w-full bg-blue-600 text-white px-2 rounded">
            Load
          </button>
        </div>
        <button onClick={testNode} className="w-full bg-blue-600 text-white px-2 py-1 rounded">
          Test Node
        </button>
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
          onNodeClick={onNodeClick}
          className="h-full"
        />
      </main>
      <LogModal open={logOpen} log={log} onClose={() => setLogOpen(false)} />
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

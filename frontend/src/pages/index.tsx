import { useCallback, useRef, useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import download from 'downloadjs';
import ApiStatus from '../components/ApiStatus';
import ThemeToggle from '../components/ThemeToggle';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { WorkflowProvider } from '../state/workflowContext';
import LLMNode, { LLMNodeData } from '../components/nodes/LLMNode';
import InputNode, { InputNodeData } from '../components/nodes/InputNode';
import OutputNode, { OutputNodeData } from '../components/nodes/OutputNode';
import ToolNode, { ToolNodeData } from '../components/nodes/ToolNode';
import ConditionNode, { ConditionNodeData } from '../components/nodes/ConditionNode';
import 'reactflow/dist/style.css';

const ReactFlow = dynamic(() => import('reactflow'), { ssr: false });

const nodeTypes = {
  llm: LLMNode,
  input: InputNode,
  output: OutputNode,
  tool: ToolNode,
  condition: ConditionNode,
};

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#ffffff' },
};

type CustomNodeData =
  | LLMNodeData
  | InputNodeData
  | OutputNodeData
  | ToolNodeData
  | ConditionNodeData;

function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);
  const { project } = useReactFlow();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedNodeId(null);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
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
      let data: any = {};
      if (type === 'llm') {
        data = {
          title: 'LLM',
          prompt: '',
          model: 'gpt-3.5-turbo',
          temperature: 1,
          maxTokens: 256,
          provider: 'openai',
        };
      } else if (type === 'input') {
        data = { title: 'Input', value: '' };
      } else if (type === 'output') {
        data = { title: 'Output' };
      } else if (type === 'tool') {
        data = { title: 'Tool', tool: '' };
      } else if (type === 'condition') {
        data = { title: 'Condition', expression: '' };
      }
      const newNode: Node<CustomNodeData> = {
        id: crypto.randomUUID(),
        type,
        position,
        data,
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
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
    | Node<CustomNodeData>
    | undefined;

  const updateNodeData = (id: string, data: Partial<CustomNodeData>) => {
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

  const importWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        setNodes(json.nodes || []);
        setEdges(json.edges || []);
      } catch {
        // ignore parse errors
      }
    };
    reader.readAsText(file);
  };

  const saveWorkflow = async () => {
    const name = prompt('Workflow name');
    if (!name) return;
    try {
      const res = await fetch(`${baseUrl}/api/workflows/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, graph: { nodes, edges } }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      setSaveMessage('Saved');
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    }
  };

  const [testResult, setTestResult] = useState<string | null>(null);

  const testLLM = async () => {
    if (!selectedNode) return;
    try {
      const res = await fetch(`${baseUrl}/api/llm/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedNode.data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const json = await res.json();
      setTestResult(json.result);
    } catch (e: any) {
      setTestResult(`Error: ${e.message}`);
    }
  };

  const renderConfigPanel = () => {
    if (!selectedNode) return null;
    const panelBase = (
      content: ReactNode,
    ) => (
      <div
        className="fixed inset-0 z-20"
        onClick={() => setSelectedNodeId(null)}
      >
        <div
          className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-600 p-4 overflow-y-auto text-black dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-1 right-1 text-xl text-gray-500"
            onClick={() => setSelectedNodeId(null)}
          >
            &times;
          </button>
          {content}
        </div>
      </div>
    );
    if (selectedNode.type === 'llm') {
      return panelBase(
        <>
          <h2 className="font-bold mb-2">LLM Node</h2>
          <label className="block text-sm">Title</label>
          <input
            className="border w-full mb-2 p-1"
            value={(selectedNode.data as LLMNodeData).title}
            onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
          />
          <label className="block text-sm">Prompt</label>
          <textarea
            className="border w-full mb-2 p-1"
            rows={4}
            value={(selectedNode.data as LLMNodeData).prompt}
            onChange={(e) => updateNodeData(selectedNode.id, { prompt: e.target.value })}
          />
          <label className="block text-sm">Model</label>
          <select
            className="border w-full mb-2 p-1"
            value={(selectedNode.data as LLMNodeData).model}
            onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })}
          >
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4">gpt-4</option>
          </select>
          <label className="block text-sm">Temperature: {(selectedNode.data as LLMNodeData).temperature}</label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            className="w-full mb-2"
            value={(selectedNode.data as LLMNodeData).temperature}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { temperature: parseFloat(e.target.value) })
            }
          />
          <label className="block text-sm">Max Tokens</label>
          <input
            type="number"
            className="border w-full mb-2 p-1"
            value={(selectedNode.data as LLMNodeData).maxTokens}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { maxTokens: parseInt(e.target.value, 10) })
            }
          />
          <label className="block text-sm">Provider</label>
          <select
            className="border w-full mb-2 p-1"
            value={(selectedNode.data as LLMNodeData).provider}
            onChange={(e) => updateNodeData(selectedNode.id, { provider: e.target.value })}
          >
            <option value="openai">OpenAI</option>
          </select>
          <button onClick={testLLM} className="bg-blue-500 text-white px-2 py-1 rounded mb-2 w-full">
            Test Node
          </button>
          {testResult && <pre className="whitespace-pre-wrap text-xs border p-2">{testResult}</pre>}
        </>
      );
    }
    if (selectedNode.type === 'input') {
      const data = selectedNode.data as InputNodeData;
      return panelBase(
        <>
          <h2 className="font-bold mb-2">Input Node</h2>
          <label className="block text-sm">Title</label>
          <input
            className="border w-full mb-2 p-1"
            value={data.title}
            onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
          />
          <label className="block text-sm">Value</label>
          <textarea
            className="border w-full mb-2 p-1"
            rows={3}
            value={data.value}
            onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
          />
        </>
      );
    }
    if (selectedNode.type === 'output') {
      const data = selectedNode.data as OutputNodeData;
      return panelBase(
        <>
          <h2 className="font-bold mb-2">Output Node</h2>
          <label className="block text-sm">Title</label>
          <input
            className="border w-full mb-2 p-1"
            value={data.title}
            onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
          />
        </>
      );
    }
    if (selectedNode.type === 'tool') {
      const data = selectedNode.data as ToolNodeData;
      return panelBase(
        <>
          <h2 className="font-bold mb-2">Tool Node</h2>
          <label className="block text-sm">Title</label>
          <input
            className="border w-full mb-2 p-1"
            value={data.title}
            onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
          />
          <label className="block text-sm">Tool Name</label>
          <input
            className="border w-full mb-2 p-1"
            value={data.tool}
            onChange={(e) => updateNodeData(selectedNode.id, { tool: e.target.value })}
          />
        </>
      );
    }
    if (selectedNode.type === 'condition') {
      const data = selectedNode.data as ConditionNodeData;
      return panelBase(
        <>
          <h2 className="font-bold mb-2">Condition Node</h2>
          <label className="block text-sm">Title</label>
          <input
            className="border w-full mb-2 p-1"
            value={data.title}
            onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
          />
          <label className="block text-sm">Expression</label>
          <textarea
            className="border w-full mb-2 p-1"
            rows={3}
            value={data.expression}
            onChange={(e) => updateNodeData(selectedNode.id, { expression: e.target.value })}
          />
        </>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen">
        <aside className="w-48 bg-gray-100 dark:bg-gray-900 p-4 space-y-2 text-black dark:text-white">
          <button
            onClick={() => setAddOpen((o) => !o)}
            className="w-full bg-blue-500 text-white px-2 py-1 rounded"
          >
            Add Node
          </button>
          {addOpen && (
            <ul className="space-y-1">
              {['llm', 'input', 'output', 'tool', 'condition'].map((t) => (
                <li key={t}>
                  <button
                    onClick={() => {
                      setDragType(t);
                      setAddOpen(false);
                    }}
                    className="w-full text-left px-2 py-1 bg-white dark:bg-gray-700 border rounded dark:border-gray-600"
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {dragType && (
            <div
              className="cursor-grab p-2 text-center bg-white dark:bg-gray-700 border rounded dark:border-gray-600"
              draggable
              onDragStart={(e) => onDragStart(e, dragType)}
              onDragEnd={() => setDragType(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/${dragType}.svg`} alt={dragType} className="mx-auto h-8 w-8 mb-1" />
              Drag {dragType}
            </div>
          )}
          <button
            onClick={exportWorkflow}
            className="w-full bg-blue-500 text-white px-2 py-1 rounded"
          >
            Export JSON
          </button>
          <label className="w-full block">
            <span className="sr-only">Import</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importWorkflow}
            />
            <span className="cursor-pointer w-full inline-block bg-blue-500 text-white px-2 py-1 rounded text-center">Import JSON</span>
          </label>
          <button
            onClick={saveWorkflow}
            className="w-full bg-blue-500 text-white px-2 py-1 rounded"
          >
            Save Workflow
          </button>
          {saveMessage && (
            <div className="text-sm whitespace-pre-wrap mt-1 text-black dark:text-white">
              {saveMessage}
            </div>
          )}
          <Link href="/settings" className="block bg-white dark:bg-gray-700 border rounded text-center px-2 py-1 dark:border-gray-600 dark:text-white">
            Settings
          </Link>
          <ThemeToggle />
          <ApiStatus />
        </aside>
        <main className="flex-1 relative dark:bg-gray-900" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            className="h-full"
          />
          {renderConfigPanel()}
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

import { useCallback, useRef, useState, useEffect, ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import download from 'downloadjs';
import toast from 'react-hot-toast';
import { useWorkflowList } from '../hooks/useWorkflowList';
import { WorkflowMeta } from '../state/workflowListStore';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from 'reactflow';
import { WorkflowProvider } from '../state/workflowContext';
import { dragNodeFactory } from '../lib/dragNodeFactory';
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
  const nodeTypesList = ['llm', 'input', 'output', 'tool', 'condition'];
  const ghostRef = useRef<HTMLDivElement>(null);
  const { workflows, mutate: refreshWorkflows } = useWorkflowList();
  const [wfOpen, setWfOpen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; wf: WorkflowMeta } | null>(null);
  const [edgeMenu, setEdgeMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wid = params.get('wid');
    if (wid) {
      fetch(`${baseUrl}/api/workflows/${wid}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            setNodes(d.nodes || []);
            setEdges(d.edges || []);
          }
        })
        .catch(() => {});
    }
  }, [baseUrl]);

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

  const createNode = (type: string, x: number, y: number) => {
    if (!rfInstance) return;
    const { x: px, y: py } = rfInstance.project({ x, y });
    const newNode = dragNodeFactory(type, px, py) as Node<CustomNodeData>;
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNode.id);
  };


  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
    if (ghostRef.current) {
      ghostRef.current.textContent = type;
      event.dataTransfer.setDragImage(ghostRef.current, 10, 10);
    }
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
      createNode(type, event.clientX - bounds.left, event.clientY - bounds.top);
    },
    [rfInstance],
  );

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

  const renameWorkflow = async (wf: WorkflowMeta) => {
    const name = prompt('New name', wf.name);
    if (!name) return;
    await fetch(`${baseUrl}/api/workflows/${wf.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    refreshWorkflows();
    setMenu(null);
  };

  const duplicateWorkflow = async (id: number) => {
    await fetch(`${baseUrl}/api/workflows/${id}/duplicate`, { method: 'POST' });
    refreshWorkflows();
    setMenu(null);
  };

  const deleteWorkflow = async (id: number) => {
    if (!confirm('Delete workflow?')) return;
    await fetch(`${baseUrl}/api/workflows/${id}`, { method: 'DELETE' });
    refreshWorkflows();
    setMenu(null);
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
        body: JSON.stringify({ name, nodes, edges }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      toast.success('Saved');
      refreshWorkflows();
    } catch (e: any) {
      toast.error(e.message);
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
        <aside
          className="w-48 bg-gray-100 dark:bg-gray-900 p-4 space-y-2 text-black dark:text-white"
          onDragOver={() => false}
        >
          <div>
            <h4 className="font-semibold mb-1">Nodes</h4>
            <ul className="space-y-1">
              {nodeTypesList.map((t) => (
                <li key={t} className="flex items-center space-x-1">
                  <span
                    className="w-3 h-3 bg-gray-400 rounded cursor-grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, t)}
                  />
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button
              onClick={() => setWfOpen((o) => !o)}
              className="w-full bg-blue-500 text-white px-2 py-1 rounded"
            >
              Workflows
            </button>
            {wfOpen && (
              <ul className="mt-1 space-y-1">
                {workflows.map((w) => (
                  <li
                    key={w.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenu({ x: e.clientX, y: e.clientY, wf: w });
                    }}
                  >
                    <button
                      onClick={() => {
                        window.location.search = `?wid=${w.id}`;
                        setWfOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 bg-white dark:bg-gray-700 border rounded dark:border-gray-600"
                    >
                      {w.name || `Workflow ${w.id}`}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
          <Link href="/settings" className="block bg-white dark:bg-gray-700 border rounded text-center px-2 py-1 dark:border-gray-600 dark:text-white">
            Settings
          </Link>
        </aside>
        <ReactFlowProvider>
          <main
            className="flex-1 relative dark:bg-gray-900"
            ref={reactFlowWrapper}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeContextMenu={(e, edge) => {
                e.preventDefault();
                setEdgeMenu({ x: e.clientX, y: e.clientY, id: edge.id });
              }}
              onInit={setRfInstance}
              className="h-full"
            />
            {renderConfigPanel()}
          </main>
        </ReactFlowProvider>
        <div
          ref={ghostRef}
          className="pointer-events-none absolute -top-10 -left-10 px-2 py-1 bg-white dark:bg-gray-700 border rounded text-sm text-black dark:text-white"
        />
        {edgeMenu && (
          <ContextMenu.Root open onOpenChange={() => setEdgeMenu(null)}>
            <ContextMenu.Trigger asChild>
              <div />
            </ContextMenu.Trigger>
            <ContextMenu.Content
              className="bg-white dark:bg-gray-700 border rounded text-sm"
              style={{ position: 'fixed', top: edgeMenu.y, left: edgeMenu.x }}
            >
              <ContextMenu.Item
                onSelect={() => {
                  setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.id));
                  setEdgeMenu(null);
                }}
                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                Delete edge
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        )}
        {menu && (
          <ul
            className="fixed z-50 bg-white dark:bg-gray-700 border rounded text-sm"
            style={{ top: menu.y, left: menu.x }}
            onClick={() => setMenu(null)}
          >
            <li>
              <button
                onClick={() => renameWorkflow(menu.wf)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Rename
              </button>
            </li>
            <li>
              <button
                onClick={() => duplicateWorkflow(menu.wf.id)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Duplicate
              </button>
            </li>
            <li>
              <button
                onClick={() => deleteWorkflow(menu.wf.id)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Delete
              </button>
            </li>
          </ul>
        )}
      </div>
    );
}

export default function Home() {
  return (
    <WorkflowProvider>
      <Head>
        <title>PixelMind Labs</title>
      </Head>
      <FlowBuilder />
    </WorkflowProvider>
  );
}

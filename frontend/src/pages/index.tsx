import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import { WorkflowProvider } from '../state/workflowContext';
import 'reactflow/dist/style.css';

const ReactFlow = dynamic(() => import('reactflow'), { ssr: false });

const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
];

const initialEdges: Edge[] = [];

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => addEdge(params, eds)),
  []);

  return (
    <WorkflowProvider>
      <Head>
        <title>PixelMind Labs</title>
      </Head>
      <div className="flex h-screen">
        <aside className="w-60 bg-gray-100 p-4">Sidebar</aside>
        <main className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            className="h-full"
          />
        </main>
      </div>
    </WorkflowProvider>
  );
}

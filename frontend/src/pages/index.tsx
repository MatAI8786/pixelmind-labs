import { useNodesState, useEdgesState } from 'reactflow';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { WorkflowProvider } from '../state/workflowContext';

const ReactFlow = dynamic(() => import('reactflow').then(m => m.ReactFlow), {
  ssr: false,
});

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <WorkflowProvider>
      <Head>
        <title>PixelMind Labs</title>
      </Head>
      <div className="flex h-screen">
        <aside className="w-60 bg-gray-100 p-4">Sidebar</aside>
        <main className="flex-1 relative">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        </main>
      </div>
    </WorkflowProvider>
  );
}

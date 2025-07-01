import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { WorkflowProvider } from '../state/workflowContext';

const ReactFlow = dynamic(() => import('react-flow-renderer').then(m => m.ReactFlow), {
  ssr: false,
});

export default function Home() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  return (
    <WorkflowProvider>
      <Head>
        <title>PixelMind Labs</title>
      </Head>
      <div className="flex h-screen">
        <aside className="w-60 bg-gray-100 p-4">Sidebar</aside>
        <main className="flex-1 relative">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={setNodes} onEdgesChange={setEdges} />
        </main>
      </div>
    </WorkflowProvider>
  );
}

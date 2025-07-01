import Head from 'next/head';
import Link from 'next/link';
import ApiConnections from '../components/ApiConnections';
import NodeSettings from '../components/NodeSettings';
import { useState } from 'react';

export default function Settings() {
  const [section, setSection] = useState<'keys' | 'nodes'>('keys');
  return (
    <div className="p-4">
      <Head>
        <title>Settings - PixelMind Labs</title>
      </Head>
      <Link href="/" className="text-blue-500">&larr; Back</Link>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <div className="flex">
        <aside className="w-40 mr-4 space-y-2">
          <button
            onClick={() => setSection('keys')}
            className={`block w-full text-left p-2 border rounded dark:border-gray-600 ${section === 'keys' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
          >
            API Keys
          </button>
          <button
            onClick={() => setSection('nodes')}
            className={`block w-full text-left p-2 border rounded dark:border-gray-600 ${section === 'nodes' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
          >
            Nodes
          </button>
        </aside>
        <div className="flex-1">
          {section === 'keys' ? <ApiConnections /> : <NodeSettings />}
        </div>
      </div>
    </div>
  );
}

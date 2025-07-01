import Head from 'next/head';
import Link from 'next/link';
import ApiConnections from '../components/ApiConnections';

export default function Settings() {
  return (
    <div className="p-4">
      <Head>
        <title>Settings - PixelMind Labs</title>
      </Head>
      <Link href="/" className="text-blue-500">&larr; Back</Link>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <ApiConnections />
    </div>
  );
}

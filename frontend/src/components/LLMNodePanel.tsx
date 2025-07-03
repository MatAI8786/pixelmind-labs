import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LLMNodePanel() {
  const [loading, setLoading] = useState(false);

  const testNode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/llm/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'hi', model: 'gpt-3.5-turbo' }) });
      const data = await res.json();
      toast(data.result || data.error || 'ok');
    } catch (e: any) {
      toast(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={testNode} disabled={loading} className="bg-blue-500 text-white px-2 py-1 rounded">
      {loading ? 'Testing...' : 'Test Node'}
    </button>
  );
}

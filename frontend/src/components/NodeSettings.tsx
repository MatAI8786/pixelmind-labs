import { useState } from 'react';

const NODES = [
  'google',
  'gemini',
  'openai',
  'etherscan',
  'tiktok',
  'gmail',
  'bscan',
  'facebook',
  'paypal',
  'binance',
];

export default function NodeSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const testKey = async (node: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/test/${node}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputs[node] || '' }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessages((m) => ({ ...m, [node]: 'Success' }));
        setErrors((e) => ({ ...e, [node]: '' }));
      } else {
        setErrors((e) => ({ ...e, [node]: data.error || 'Error' }));
        setMessages((m) => ({ ...m, [node]: '' }));
      }
    } catch (e: any) {
      setErrors((er) => ({ ...er, [node]: e.message }));
      setMessages((m) => ({ ...m, [node]: '' }));
    }
  };

  return (
    <div>
      <h3 className="font-bold mb-2">Nodes</h3>
      <ul className="space-y-2">
        {NODES.map((n) => (
          <li key={n}>
            <details className="border rounded p-2 dark:border-gray-600">
              <summary className="cursor-pointer capitalize">{n}</summary>
              <div className="mt-2 space-y-2">
                <input
                  type="password"
                  placeholder="API Key"
                  className="border w-full p-1 bg-white dark:bg-gray-700 text-black dark:text-white caret-blue-500 dark:border-gray-600"
                  value={inputs[n] || ''}
                  onChange={(e) =>
                    setInputs({ ...inputs, [n]: e.target.value })
                  }
                />
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => testKey(n)}
                >
                  Test Key
                </button>
                {messages[n] && (
                  <div className="text-sm text-green-500">{messages[n]}</div>
                )}
                {errors[n] && (
                  <pre className="text-sm text-red-500 whitespace-pre-wrap">
                    {errors[n]}
                  </pre>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

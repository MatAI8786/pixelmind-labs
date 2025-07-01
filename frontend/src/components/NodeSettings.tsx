import { useEffect, useState } from 'react';

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
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchStatus = async (node: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/test/${node}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatuses((s) => ({ ...s, [node]: 'ok' }));
        setErrors((e) => ({ ...e, [node]: '' }));
      } else {
        setStatuses((s) => ({ ...s, [node]: 'error' }));
        setErrors((e) => ({ ...e, [node]: data.error || 'Error' }));
      }
      setMessages((m) => ({ ...m, [node]: JSON.stringify(data, null, 2) }));
    } catch (e: any) {
      setStatuses((s) => ({ ...s, [node]: 'error' }));
      setErrors((er) => ({ ...er, [node]: e.message }));
      setMessages((m) => ({ ...m, [node]: '' }));
    }
  };

  useEffect(() => {
    NODES.forEach((n) => fetchStatus(n));
  }, [baseUrl]);

  return (
    <div>
      <h3 className="font-bold mb-2">Nodes</h3>
      <ul className="space-y-2">
        {NODES.map((n) => (
          <li key={n}>
            <details className="border rounded p-2 dark:border-gray-600">
              <summary className="cursor-pointer capitalize flex items-center">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${
                    statuses[n] === 'ok'
                      ? 'bg-green-500'
                      : statuses[n] === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                {n}
              </summary>
              <div className="mt-2 space-y-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => fetchStatus(n)}
                >
                  Test Endpoint
                </button>
                {messages[n] && (
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {messages[n]}
                  </pre>
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

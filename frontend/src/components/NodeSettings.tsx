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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const fetchStatus = async (node: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/test/${node}`);
      const data = await res.json();
      const status: string = data.status || 'failed';
      setStatuses((s) => ({ ...s, [node]: status }));
      if (status === 'success') {
        setErrors((e) => ({ ...e, [node]: '' }));
      } else {
        setErrors((e) => ({ ...e, [node]: data.message || 'Error' }));
      }
    } catch (e: any) {
      setStatuses((s) => ({ ...s, [node]: 'failed' }));
      setErrors((er) => ({ ...er, [node]: e.message }));
    }
  };

  const loadKeys = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/keys/list`);
      if (res.ok) {
        const data = await res.json();
        const vals: Record<string, string> = {};
        data.forEach((d: any) => {
          const stored = sessionStorage.getItem(`key_${d.provider}`) || '';
          vals[d.provider] = stored;
        });
        setInputs(vals);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadKeys();
    NODES.forEach((n) => fetchStatus(n));
  }, [baseUrl]);

  const handleInputChange = (node: string, value: string) => {
    setInputs((i) => ({ ...i, [node]: value }));
    sessionStorage.setItem(`key_${node}`, value);
  };

  return (
    <div>
      <h3 className="font-bold mb-2">Nodes</h3>
      <ul className="space-y-2">
        {NODES.map((n) => (
          <li key={n} className="border rounded p-2 dark:border-gray-600">
            <div className="flex items-center mb-2">
              <span className="capitalize flex-1">{n}</span>
              {statuses[n] && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    statuses[n] === 'success'
                      ? 'bg-green-600'
                      : statuses[n] === 'warning'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                >
                  {statuses[n] === 'success'
                    ? '✔️ Success'
                    : statuses[n] === 'warning'
                    ? '⚠️ Warning'
                    : '❌ Failed'}
                </span>
              )}
            </div>
            <input
              type="password"
              className="border p-1 mb-2 w-full dark:border-gray-600 dark:bg-gray-700"
              value={inputs[n] || ''}
              onChange={(e) => handleInputChange(n, e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => fetchStatus(n)}
            >
              Test Key
            </button>
            {errors[n] && (
              <div className="text-sm text-red-500 mt-1 whitespace-pre-wrap">
                {errors[n]}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

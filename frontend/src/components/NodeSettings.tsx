import { useEffect, useState } from 'react';
import ProviderTestModal from './ProviderTestModal';

const PROVIDERS = [
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
  const [open, setOpen] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    const vals: Record<string, string> = {};
    PROVIDERS.forEach((p) => {
      vals[p] = sessionStorage.getItem(`key_${p}`) || '';
    });
    setInputs(vals);
  }, []);

  const handleInputChange = (prov: string, val: string) => {
    setInputs((i) => ({ ...i, [prov]: val }));
    sessionStorage.setItem(`key_${prov}`, val);
  };

  const testProvider = async (prov: string) => {
    setStatuses((s) => ({ ...s, [prov]: 'pending' }));
    try {
      const res = await fetch(`${baseUrl}/api/test/${prov}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputs[prov] || '' }),
      });
      const data = await res.json();
      setStatuses((s) => ({ ...s, [prov]: data.status || 'failed' }));
      setLogs((l) => ({ ...l, [prov]: data.logs ? data.logs.join('\n') : data.message }));
      setShowLog(true);
    } catch (e: any) {
      setStatuses((s) => ({ ...s, [prov]: 'failed' }));
      setLogs((l) => ({ ...l, [prov]: e.message }));
      setShowLog(true);
    }
  };

  const statusColor = (status: string | undefined) => {
    if (status === 'success') return 'text-green-400';
    if (status === 'pending') return 'text-orange-400';
    if (status === 'warning') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div>
      <h3 className="font-bold mb-2">Nodes</h3>
      <ul className="space-y-2">
        {PROVIDERS.map((p) => (
          <li
            key={p}
            className="border rounded p-2 dark:border-gray-600 dark:text-white cursor-pointer"
            onClick={() => setOpen(p)}
          >
            <span className="capitalize flex-1">{p}</span>
            {statuses[p] && (
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded ${
                  statuses[p] === 'success'
                    ? 'bg-green-600'
                    : statuses[p] === 'pending'
                    ? 'bg-orange-600'
                    : statuses[p] === 'warning'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
              >
                {statuses[p]}
              </span>
            )}
          </li>
        ))}
      </ul>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 text-white p-4 rounded w-96 relative">
            <button className="absolute top-1 right-1" onClick={() => setOpen(null)}>
              &times;
            </button>
            <h4 className="font-bold mb-2 capitalize">{open}</h4>
            <input
              type="password"
              className="w-full mb-2 p-2 rounded bg-gray-700 border border-gray-600"
              value={inputs[open] || ''}
              onChange={(e) => handleInputChange(open, e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded w-full"
              onClick={() => testProvider(open)}
            >
              Test Key
            </button>
          </div>
          <ProviderTestModal
            open={showLog}
            log={logs[open] || ''}
            onClose={() => setShowLog(false)}
          />
        </div>
      )}
    </div>
  );
}

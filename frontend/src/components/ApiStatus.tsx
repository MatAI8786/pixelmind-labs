import { useEffect, useState } from 'react';
import { Tooltip } from '@headlessui/react';
import ProviderTestModal from './ProviderTestModal';

interface HealthItem {
  status: string;
  msg: string;
}

type HealthData = Record<string, HealthItem>;

export default function ApiStatus() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setError(null);
        } else {
          const text = await res.text();
          setError(text || res.statusText);
          setData(null);
        }
      } catch (e: any) {
        setError(e.message);
        setData(null);
      }
    }
    fetchHealth();
  }, [baseUrl]);

  const runTest = async (prov: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/test/${prov}`);
      const j = await res.json();
      setLog(JSON.stringify(j, null, 2));
    } catch (e: any) {
      setLog(e.message);
    }
    setOpen(true);
  };

  if (!data) {
    return (
      <div>
        <h3 className="font-bold mb-2">API Status</h3>
        <p className="text-red-500">{error ? `Error: ${error}` : 'Unable to fetch status'}</p>
      </div>
    );
  }

  return (
    <div>
      <ProviderTestModal open={open} log={log} onClose={() => setOpen(false)} />
      <h3 className="font-bold mb-2">API Status</h3>
      <div className="flex space-x-2">
        {Object.entries(data).map(([key, value]) => {
          const color =
            value.status === 'ok'
              ? 'bg-emerald-500'
              : value.status === 'warning'
              ? 'bg-amber-400'
              : 'bg-rose-500';
          return (
            <Tooltip key={key} content={value.msg}>
              <span
                onClick={() => runTest(key)}
                className={`h-3 w-3 rounded-full ${color} cursor-pointer`}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

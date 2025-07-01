import { useEffect, useState } from 'react';

interface HealthData {
  [key: string]: string;
}

export default function ApiStatus() {
  const [data, setData] = useState<HealthData | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      }
    }
    fetchHealth();
  }, [baseUrl]);

  if (!data) {
    return (
      <div>
        <h3 className="font-bold mb-2">API Status</h3>
        <p className="text-red-500">Unable to fetch status</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-2">API Status</h3>
      <ul className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <li key={key} className="flex items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${
                value === 'ok' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{key}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

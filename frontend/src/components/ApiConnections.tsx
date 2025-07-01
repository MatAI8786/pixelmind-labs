import { useEffect, useState } from 'react';

interface KeyInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
}

const PROVIDERS = ['openai', 'anthropic', 'mistral'];

export default function ApiConnections() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [provider, setProvider] = useState<string>('openai');
  const [keyInput, setKeyInput] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [health, setHealth] = useState<Record<string, string>>({});

  const fetchKeys = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/keys/list`);
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch {
      // ignore errors
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchHealth();
  }, [baseUrl]);

  const saveKey = async () => {
    const url = `${baseUrl}/api/keys/${editing ? 'update' : 'add'}`;
    const body = { provider, key: keyInput };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        sessionStorage.setItem(`key_${provider}`, keyInput);
        setKeyInput('');
        setEditing(null);
        setMessage('Saved');
        fetchKeys();
        fetchHealth();
      } else {
        setMessage('Error saving');
      }
    } catch {
      setMessage('Error saving');
    }
  };

  const deleteKey = async (prov: string) => {
    try {
      await fetch(`${baseUrl}/api/keys/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: prov }),
      });
      sessionStorage.removeItem(`key_${prov}`);
      fetchKeys();
      fetchHealth();
    } catch {
      // ignore
    }
  };

  const validateKey = async (prov: string) => {
    const stored = sessionStorage.getItem(`key_${prov}`);
    try {
      await fetch(`${baseUrl}/api/keys/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: prov, key: stored }),
      });
      fetchKeys();
      fetchHealth();
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h3 className="font-bold mb-2">API Connections</h3>
      <ul className="space-y-1">
        {keys.map((k) => {
          const h = health[k.provider];
          const color =
            h === 'ok' ? 'bg-green-500' : h === 'missing_key' ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <li key={k.provider} className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              <span className="w-24 capitalize">{k.provider}</span>
              <span>{k.status}</span>
              {k.last_checked && (
                <span className="text-xs text-gray-500">{k.last_checked}</span>
              )}
              <button
                className="text-blue-500 text-sm"
                onClick={() => {
                  setProvider(k.provider);
                  setEditing(k.provider);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 text-sm"
                onClick={() => deleteKey(k.provider)}
              >
                Delete
              </button>
              <button
                className="text-green-500 text-sm"
                onClick={() => validateKey(k.provider)}
              >
                Test Key
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-2">
        <h4 className="font-semibold">
          {editing ? `Edit ${editing} Key` : 'Add API Key'}
        </h4>
        <div className="flex space-x-2">
          <select
            className="border p-1"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="password"
            className="border p-1 flex-1"
            placeholder="API Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button
            onClick={saveKey}
            className="bg-blue-500 text-white px-2 rounded"
          >
            Save
          </button>
        </div>
        {message && <div className="text-sm text-gray-600">{message}</div>}
      </div>
    </div>
  );
}

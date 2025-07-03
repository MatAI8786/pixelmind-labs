import { useEffect, useState } from 'react';
import ProviderTestModal from './ProviderTestModal';
import NodeRow from './NodeRow';

interface NodeInfo {
  provider: string;
  has_key: boolean;
  health?: string | null;
  last_error?: string | null;
  checked_at?: string | null;
}

export default function NodeSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [rows, setRows] = useState<NodeInfo[]>([]);
  const [selected, setSelected] = useState<NodeInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/keys/list`);
        if (res.ok) {
          const data = await res.json();
          setRows(data);
        }
      } catch (e) {
        /* empty */
      }
    };
    load();
  }, [baseUrl]);

  return (
    <div>
      <h3 className="font-bold mb-2">Nodes</h3>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="p-2 border">Provider</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Last Checked</th>
            <th className="p-2 border">Last Error</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <NodeRow key={r.provider} item={r} onClick={() => setSelected(r)} />
          ))}
        </tbody>
      </table>
      {selected && (
        <ProviderTestModal
          open={true}
          log={JSON.stringify(selected, null, 2)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

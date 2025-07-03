import useSWR from 'swr';
import { useState } from 'react';
import ProviderTestModal from './ProviderTestModal';
import NodeRow from './NodeRow';

interface NodeInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
  last_error?: string | null;
}

export default function NodeSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: rows = [], mutate } = useSWR<NodeInfo[]>(`${baseUrl}/api/nodes`, fetcher);
  const [selected, setSelected] = useState<NodeInfo | null>(null);

  const retest = async (provider: string) => {
    await fetch(`${baseUrl}/api/nodes/${provider}/retest`, { method: 'POST' });
    mutate();
  };

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
        <tbody className="overflow-y-auto max-h-80 block">
          {rows.map((r) => (
            <NodeRow
              key={r.provider}
              item={r}
              onRetest={() => retest(r.provider)}
              onClick={() => setSelected(r)}
            />
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

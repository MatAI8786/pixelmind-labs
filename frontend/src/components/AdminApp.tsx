import { useEffect, useState } from 'react';
import ProviderTestModal from './ProviderTestModal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';

export interface ProviderInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
  last_error?: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminApp() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await fetch(`${baseUrl}/api/providers`);
    const data = await res.json();
    setProviders(data);
  };

  useEffect(() => {
    load();
  }, []);

  const runTest = async (name: string) => {
    setProviders((ps) =>
      ps.map((p) =>
        p.provider === name ? { ...p, status: 'testing...' } : p,
      ),
    );
    try {
      const res = await fetch(`${baseUrl}/api/providers/${name}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
      setOpen(true);
      if (res.ok && data.success) {
        setProviders((ps) =>
          ps.map((p) =>
            p.provider === name
              ? {
                  ...p,
                  status: '✅',
                  last_checked: new Date().toISOString(),
                  last_error: '',
                }
              : p,
          ),
        );
      } else {
        setProviders((ps) =>
          ps.map((p) =>
            p.provider === name
              ? { ...p, status: '❌', last_error: data.detail || '' }
              : p,
          ),
        );
      }
    } catch (e: any) {
      setLog(String(e));
      setOpen(true);
      setProviders((ps) =>
        ps.map((p) =>
          p.provider === name ? { ...p, status: '❌', last_error: e.message } : p,
        ),
      );
    }
    load();
  };

  return (
    <div>
      {providers.length === 0 && (
        <div className="mb-2 rounded bg-yellow-100 text-yellow-800 p-2">
          No providers registered
        </div>
      )}
      {providers.length > 0 && (
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead>Last Error</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((p) => (
              <TableRow key={p.provider}>
                <TableCell>{p.provider}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.last_checked || ''}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {p.last_error || ''}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => runTest(p.provider)}
                    className="text-blue-600"
                  >
                    Test
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ProviderTestModal open={open} log={log} onClose={() => setOpen(false)} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore json parse errors
      }

      setLog(JSON.stringify(data ?? {}, null, 2));
      setOpen(true);

      const errorMsg = Array.isArray(data?.errors)
        ? data.errors[0]?.msg || 'Unknown error'
        : data?.details || data?.message || null;

      if (res.ok && data?.success && !errorMsg) {
        toast.success('Provider healthy');
        setProviders((ps) =>
          ps.map((p) =>
            p.provider === name
              ? {
                  ...p,
                  status: '✅ healthy',
                  last_checked: new Date().toISOString(),
                  last_error: '–',
                }
              : p,
          ),
        );
      } else {
        const msg = errorMsg || 'Error';
        toast.error(msg);
        setProviders((ps) =>
          ps.map((p) =>
            p.provider === name
              ? {
                  ...p,
                  status: '❌ error',
                  last_checked: new Date().toISOString(),
                  last_error: msg,
                }
              : p,
          ),
        );
      }
    } catch (e: any) {
      toast.error(e.message);
      setLog(String(e));
      setOpen(true);
      setProviders((ps) =>
        ps.map((p) =>
          p.provider === name
            ? {
                ...p,
                status: '❌ error',
                last_checked: new Date().toISOString(),
                last_error: e.message,
              }
            : p,
        ),
      );
    }
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

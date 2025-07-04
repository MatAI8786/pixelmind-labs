import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';
import { useProviders, ProviderInfo } from '../lib/useProviders';
import en from '../locales/en.json';
import { Button } from './ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from './ui/table';

export default function ProvidersTable() {
  const { providers, mutate } = useProviders();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);

  const testProvider = async (prov: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/providers/${prov}/test`);
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
      toast.success('ok');
    } catch (e: any) {
      setLog(e.message);
      toast.error(e.message);
    } finally {
      setOpen(true);
      mutate();
    }
  };

  const copyLog = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(log);
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded w-full max-w-md text-black dark:text-white">
            <Dialog.Title className="font-bold mb-2">{en.test} Log</Dialog.Title>
            <pre className="bg-black text-white p-2 rounded text-xs max-h-[60vh] overflow-auto whitespace-pre-wrap">{log}</pre>
            <div className="text-right mt-2">
              <button onClick={copyLog} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                {en.copyLog}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{en.provider}</TableHead>
            <TableHead>{en.status}</TableHead>
            <TableHead>{en.lastChecked}</TableHead>
            <TableHead>{en.lastError}</TableHead>
            <TableHead>{en.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Array.isArray(providers) ? providers : []).map((p: ProviderInfo) => (
            <TableRow key={p.provider} className="border-b last:border-b-0">
              <TableCell className="capitalize">{p.provider}</TableCell>
              <TableCell>
                <span className={p.status === 'ok' ? 'text-green-500' : 'text-red-500'}>
                  {p.status === 'ok' ? '✓' : '✗'}
                </span>
              </TableCell>
              <TableCell>{p.last_checked || 'n/a'}</TableCell>
              <TableCell className="max-w-[160px] truncate">{p.last_error || 'n/a'}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => testProvider(p.provider)}>
                  {en.test}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

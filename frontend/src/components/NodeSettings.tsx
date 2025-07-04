import { useNodes, NodeInfo } from '../hooks/useNodes';
import { Button } from './ui/button';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from './ui/table';
import { motion } from 'framer-motion';

export default function NodeSettings() {
  const { nodes, mutate } = useNodes();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const retest = async (provider: string) => {
    await fetch(`${baseUrl}/api/providers/${provider}/test`, { method: 'POST' });
    mutate();
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Last Error</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Array.isArray(nodes) ? nodes : []).map((n: any) => (
            <motion.tr
              key={n.provider}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="border-b last:border-b-0"
            >
              <TableCell className="capitalize">{n.provider}</TableCell>
              <TableCell>
                <span className={n.health === 'ok' ? 'text-green-500' : 'text-red-500'}>
                  {n.health === 'ok' ? '✓' : '✗'}
                </span>
              </TableCell>
              <TableCell>{n.checked_at || 'n/a'}</TableCell>
              <TableCell className="max-w-[160px] truncate">
                {n.last_error || 'n/a'}
              </TableCell>
              <TableCell>
                <Button onClick={() => retest(n.provider)} size="sm">
                  Retest
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

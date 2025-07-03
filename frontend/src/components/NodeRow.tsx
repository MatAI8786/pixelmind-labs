interface NodeInfo {
  provider: string;
  has_key: boolean;
  health?: string | null;
  last_error?: string | null;
  checked_at?: string | null;
}

interface NodeRowProps {
  item: NodeInfo;
  onClick: () => void;
}

export default function NodeRow({ item, onClick }: NodeRowProps) {
  const color =
    item.health === 'ok'
      ? 'bg-green-500'
      : item.health === 'warning'
      ? 'bg-yellow-500'
      : 'bg-red-500';
  return (
    <tr onClick={onClick} data-testid="node-row" className="cursor-pointer">
      <td className="p-2 border capitalize">{item.provider}</td>
      <td className="p-2 border">
        <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      </td>
      <td className="p-2 border">{item.checked_at || '-'}</td>
      <td className="p-2 border text-xs">{item.last_error || '-'}</td>
      <td className="p-2 border">
        <button className="text-blue-500 text-sm">View</button>
      </td>
    </tr>
  );
}

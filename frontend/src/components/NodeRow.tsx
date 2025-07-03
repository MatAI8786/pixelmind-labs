interface NodeInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
  last_error?: string | null;
}

interface NodeRowProps {
  item: NodeInfo;
  onClick?: () => void;
  onRetest?: () => void;
  loading?: boolean;
}

export default function NodeRow({ item, onClick, onRetest, loading }: NodeRowProps) {
  const color =
    item.status === 'ok'
      ? 'bg-green-500'
      : item.status === 'warning'
      ? 'bg-yellow-500'
      : 'bg-red-500';
  return (
    <tr onClick={onClick} data-testid="node-row" className="cursor-pointer">
      <td className="p-2 border capitalize">{item.provider}</td>
      <td className="p-2 border">
        <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      </td>
      <td className="p-2 border">{item.last_checked || '-'}</td>
      <td className="p-2 border text-xs">{item.last_error || '-'}</td>
      <td className="p-2 border space-x-1">
        {onRetest && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetest();
            }}
            disabled={loading}
            className="text-blue-500 text-sm"
          >
            Retest
          </button>
        )}
        {onClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-blue-500 text-sm"
          >
            View
          </button>
        )}
      </td>
    </tr>
  );
}

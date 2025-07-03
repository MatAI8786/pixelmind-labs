import { Dialog } from '@headlessui/react';

interface ProviderTestModalProps {
  open: boolean;
  log: string;
  onClose: () => void;
}

export default function ProviderTestModal({ open, log, onClose }: ProviderTestModalProps) {
  const copyLog = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(log);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded p-4 w-full max-w-md text-black dark:text-white">
        <button onClick={onClose} className="absolute top-2 right-2 text-lg">✖︎</button>
        <Dialog.Title className="font-bold mb-2">Provider Log</Dialog.Title>
        <pre className="bg-black text-white p-2 rounded text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap">
{log}
        </pre>
        <div className="text-right mt-2">
          <button onClick={copyLog} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Copy JSON</button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

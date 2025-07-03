import { Dialog } from '@headlessui/react';

interface LogModalProps {
  open: boolean;
  log: string;
  onClose: () => void;
}

export default function LogModal({ open, log, onClose }: LogModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded p-4 w-full max-w-md text-black dark:text-white">
        <button onClick={onClose} className="absolute top-2 right-2 text-lg">✖︎</button>
        <Dialog.Title className="font-bold mb-2">Execution Log</Dialog.Title>
        <pre className="bg-black text-white p-2 rounded text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap">{log}</pre>
      </Dialog.Panel>
    </Dialog>
  );
}

import { Admin, Resource, List, Datagrid, TextField, useRefresh } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const dataProvider = simpleRestProvider(`${baseUrl}/api`);

const TestButton = ({ record }: any) => {
  const refresh = useRefresh();
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);
  const runTest = async () => {
    const res = await fetch(`${baseUrl}/api/providers/${record.provider}/test`, {
      method: 'POST',
    });
    const data = await res.json();
    setLog(JSON.stringify(data, null, 2));
    setOpen(true);
    refresh();
  };
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(log);
  };
  return (
    <>
      <button onClick={runTest}>Test</button>
      <Dialog open={open} onClose={() => setOpen(false)} className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={() => setOpen(false)} />
        <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded p-4 w-full max-w-md text-black dark:text-white">
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-lg">✖︎</button>
          <Dialog.Title className="font-bold mb-2">Test Log</Dialog.Title>
          <pre className="bg-black text-white p-2 rounded text-xs max-h-[60vh] overflow-auto whitespace-pre-wrap">{log}</pre>
          <div className="text-right mt-2">
            <button onClick={copy} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Copy log</button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

const ProviderList = (props: any) => (
  <List {...props} resource="providers">
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="provider" label="Provider" />
      <TextField source="status" label="Status" />
      <TextField source="last_checked" label="Last Checked" />
      <TextField source="last_error" label="Last Error" />
      <TestButton />
    </Datagrid>
  </List>
);

export default function AdminApp() {
  return (
    <Admin dataProvider={dataProvider} basename="/admin">
      <Resource name="providers" list={ProviderList} />
    </Admin>
  );
}

import useSWR from 'swr';
import { useWorkflowListStore, WorkflowMeta } from '../state/workflowListStore';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useWorkflowList() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { setList } = useWorkflowListStore();
  const { data, error, mutate } = useSWR<WorkflowMeta[]>(
    `${baseUrl}/api/workflows`,
    fetcher,
    { onSuccess: (d) => setList(d) }
  );
  return { workflows: data || [], loading: !error && !data, error, mutate };
}

import useSWR from 'swr';

export interface NodeInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
  last_error?: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNodes() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data, error, mutate } = useSWR<NodeInfo[]>(`${baseUrl}/api/providers`, fetcher);
  return { nodes: data || [], loading: !error && !data, error, mutate };
}

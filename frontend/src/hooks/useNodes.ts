import useSWR from 'swr';

export interface NodeInfo {
  provider: string;
  health?: string;
  checked_at?: string | null;
  last_error?: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNodes() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data, error, mutate } = useSWR<NodeInfo[]>(
    `${baseUrl}/api/keys/list`,
    fetcher,
  );
  return { nodes: data || [], loading: !error && !data, error, mutate };
}

import useSWR from 'swr';

export interface ProviderInfo {
  provider: string;
  status: string;
  last_checked?: string | null;
  last_error?: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProviders() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { data, error, mutate } = useSWR<ProviderInfo[]>(
    `${baseUrl}/api/providers`,
    fetcher,
  );
  return { providers: data || [], loading: !error && !data, error, mutate };
}

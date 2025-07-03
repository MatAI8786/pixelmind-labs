import '../styles/globals.css';
import type { AppProps } from 'next/app';
import ErrorBoundary from '../components/ErrorBoundary';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.classList.toggle('dark', pageProps.theme === 'dark');
  }, [pageProps.theme]);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <Toaster
        toastOptions={{
          style: { background: '#1e293b', color: '#f8fafc' },
          duration: 3000,
        }}
      />
    </ErrorBoundary>
  );
}

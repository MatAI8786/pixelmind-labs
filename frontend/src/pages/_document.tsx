import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="dark">
      <Head />
      <body className="bg-gray-900 text-white cursor-default">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

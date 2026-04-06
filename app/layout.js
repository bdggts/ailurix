import Providers from './providers';
import './globals.css';

export const metadata = {
  title: 'Ailurix Studios | Play. Earn. Own.',
  description: 'The #1 blockchain gaming studio. Play Ailurix Arena, earn $ARX tokens, and build your on-chain empire.',
  manifest: '/manifest.json',
  themeColor: '#f59e0b',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ailurix Studios',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{margin:0,padding:0,background:'#030308'}}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

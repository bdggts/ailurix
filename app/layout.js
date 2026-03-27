import Providers from './providers';
import './globals.css';

export const metadata = {
  title: 'Dominex — Conquer. Dominate. Earn.',
  description: 'The most addictive crypto strategy game on Base. Mine $DMX, raid territories, build your empire.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

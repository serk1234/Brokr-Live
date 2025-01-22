import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'brokr',
  description: 'Your description here',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/1.png" type="image/png" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="brokr" />
        <meta property="og:description" content="A brief description of your website or product." />
        <meta property="og:image" content="https://brokr.app/1.png" />
        <meta property="og:url" content="https://brokr.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="brokr" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />


      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

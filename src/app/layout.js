import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'brokr',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/1.png" type="image/png" />
        {/* Add additional metadata */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import { Geist, Geist_Mono, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { WhatsAppFloatingButton } from '@/components/WhatsAppButton'
import PageTransition from '@/components/PageTransition'
import Analytics from '@/components/Analytics'


const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://avegatasta.com'),
  title: {
    template: '%s | Avegatasta',
    default: 'Avegatasta | Premium Jal Urja Solutions in Nashik',
  },
  description: 'Authorized distributor of V-Guard, Zero B, and Wilo water solutions in Nashik. We provide premium water heating, pumping, and treatment solutions.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://avegatasta.com',
    siteName: 'Avegatasta Jal Urja Solutions',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${dmSerif.variable}`}>
      <body className="site-motion font-sans antialiased bg-white text-brand-950" suppressHydrationWarning>
        {/* Analytics (GTM + Meta Pixel) — gated by the admin dashboard
            `analytics_enabled` setting; disabled by default (e.g. on UAT). */}
        <Analytics />

        <PageTransition>{children}</PageTransition>
        <WhatsAppFloatingButton />
      </body>
    </html>
  )
}

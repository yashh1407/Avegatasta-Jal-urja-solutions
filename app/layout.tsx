import { Geist, Geist_Mono, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { WhatsAppFloatingButton } from '@/components/WhatsAppButton'
import PageTransition from '@/components/PageTransition'


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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KRLD5J4P');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="site-motion font-sans antialiased bg-white text-brand-950" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KRLD5J4P"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <PageTransition>{children}</PageTransition>
        <WhatsAppFloatingButton />
      </body>
    </html>
  )
}

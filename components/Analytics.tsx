'use client';

/**
 * Runtime-gated analytics loader.
 *
 * Reads analytics_enabled / gtm_id / meta_pixel_id from the public site-settings
 * API at runtime and only injects Google Tag Manager + Meta Pixel when analytics
 * is enabled in the admin dashboard. This keeps public pages statically rendered
 * while letting the dashboard toggle take effect (within the settings cache TTL)
 * without a rebuild — and means staging/UAT (analytics off) loads no trackers.
 */
import Script from 'next/script';
import { useEffect, useState } from 'react';

interface AnalyticsConfig {
  enabled: boolean;
  gtmId?: string;
  pixelId?: string;
}

export default function Analytics() {
  const [cfg, setCfg] = useState<AnalyticsConfig>({ enabled: false });

  useEffect(() => {
    let active = true;
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((s: Record<string, string | null>) => {
        if (!active) return;
        setCfg({
          enabled: s.analytics_enabled === 'true',
          gtmId: s.gtm_id || undefined,
          pixelId: s.meta_pixel_id || undefined,
        });
      })
      .catch(() => {
        /* settings unavailable — leave analytics off */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!cfg.enabled) return null;

  return (
    <>
      {cfg.gtmId && (
        <Script id="gtm-loader" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${cfg.gtmId}');`}
        </Script>
      )}
      {cfg.pixelId && (
        <Script id="meta-pixel-loader" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cfg.pixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}

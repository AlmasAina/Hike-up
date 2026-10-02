import Script from 'next/script';

/**
 * Google Analytics 4 — loads only when an admin sets a Measurement ID in Site Settings.
 * No tracking IDs are hard-coded.
 */
export function Analytics({ measurementId }: { measurementId?: string }) {
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}

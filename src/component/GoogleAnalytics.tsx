'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 — só carrega se NEXT_PUBLIC_GA_MEASUREMENT_ID estiver
 * definido no ambiente (não quebra nada em dev/local sem GA configurado).
 *
 * Setup, quando tiver o Measurement ID (formato G-XXXXXXX):
 *   1. Criar propriedade GA4 em https://analytics.google.com para easydev.com.br
 *   2. Adicionar NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX no .env (e no
 *      ambiente de produção/deploy)
 *   3. Reiniciar o dev server / redeployar — o componente já está
 *      registrado em src/app/layout.tsx, não precisa mexer em mais nada.
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

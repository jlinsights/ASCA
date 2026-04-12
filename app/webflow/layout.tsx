import Script from 'next/script'
import { WebflowStyles } from '@/components/webflow/webflow-styles'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function WebflowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebflowStyles />

      {children}

      <Script
        src='https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
        strategy='afterInteractive'
      />
      <Script id='webfont-load' strategy='afterInteractive'>
        {`if(window.WebFont){WebFont.load({google:{families:["Poppins:300,400,500,600,700"]}})}`}
      </Script>
    </>
  )
}

'use client'

import Script from 'next/script'

export function KakaoScript() {
  return (
    <>
      <Script
        src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
        integrity='sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'
        crossOrigin='anonymous'
        strategy='lazyOnload'
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            // Use environment variable or fallback placeholder (which will log error but prevent crash)
            const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY'
            window.Kakao.init(appKey)
          }
        }}
      />
    </>
  )
}

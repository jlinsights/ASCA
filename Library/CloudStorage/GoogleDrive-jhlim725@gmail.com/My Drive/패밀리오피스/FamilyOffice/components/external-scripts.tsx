'use client'

import Script from 'next/script'
import { useEffect } from 'react'

export function ExternalScripts() {
  const channelIOKey = process.env.NEXT_PUBLIC_CHANNEL_IO_KEY || '4c0cca0c-7cf1-4441-8f11-3e04995a4a78'
  const calComUrl = process.env.NEXT_PUBLIC_CAL_URL || 'https://cal.com/familyoffice'
  const hubspotId = process.env.NEXT_PUBLIC_HUBSPOT_ID || '43932435'

  useEffect(() => {
    // 디버깅: 환경 변수 확인
    console.log('🔧 External Scripts Debug Info:')
    console.log('ChannelIO Key:', channelIOKey.substring(0, 8) + '...')
    console.log('Cal.com URL:', calComUrl)
    console.log('HubSpot ID:', hubspotId)

    // ChannelIO 초기화 함수
    const initChannelIO = () => {
      if (typeof window !== 'undefined' && window.ChannelIO) {
        console.log('✅ ChannelIO initializing...')
        try {
          window.ChannelIO('boot', {
            pluginKey: channelIOKey
          })
          console.log('✅ ChannelIO initialized successfully')
        } catch (error) {
          console.error('❌ ChannelIO initialization failed:', error)
        }
      } else {
        console.log('⏳ ChannelIO not ready yet')
      }
    }

    // Cal.com 위젯 초기화 함수  
    const initCalCom = () => {
      if (typeof window !== 'undefined' && window.Cal) {
        console.log('✅ Cal.com initializing...')
        try {
          window.Cal('init', {
            origin: 'https://app.cal.com'
          })
          console.log('✅ Cal.com initialized successfully')
        } catch (error) {
          console.error('❌ Cal.com initialization failed:', error)
        }
      } else {
        console.log('⏳ Cal.com not ready yet')
      }
    }

    // 스크립트 로딩 상태 체크
    const checkScripts = () => {
      console.log('🔍 Checking script availability:')
      console.log('ChannelIO available:', typeof window.ChannelIO !== 'undefined')
      console.log('Cal.com available:', typeof window.Cal !== 'undefined')
    }

    // 즉시 체크
    checkScripts()

    // DOM이 로드된 후 실행
    if (document.readyState === 'complete') {
      initChannelIO()
      initCalCom()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          checkScripts()
          initChannelIO()
          initCalCom()
        }, 1000) // 1초 후 재시도
      })
    }

    // 5초 후 강제 재시도
    const retryTimer = setTimeout(() => {
      console.log('🔄 Retrying script initialization...')
      checkScripts()
      initChannelIO()
      initCalCom()
    }, 5000)

    return () => {
      clearTimeout(retryTimer)
    }
  }, [channelIOKey, calComUrl])

  return (
    <>
      {/* HubSpot */}
      <Script
        id="hubspot"
        strategy="afterInteractive"
        src={`https://js.hs-scripts.com/${hubspotId}.js`}
        defer
        onLoad={() => console.log('✅ HubSpot script loaded')}
        onError={(e) => console.error('❌ HubSpot script failed:', e)}
      />

      {/* ChannelIO */}
      <Script
        id="channel-io"
        strategy="afterInteractive"
        src="https://cdn.channel.io/plugin/ch-plugin-web.js"
        onLoad={() => {
          console.log('✅ ChannelIO script loaded')
          if (typeof window !== 'undefined' && window.ChannelIO) {
            window.ChannelIO('boot', {
              pluginKey: channelIOKey
            })
            console.log('✅ ChannelIO booted via onLoad')
          }
        }}
        onError={(e) => console.error('❌ ChannelIO script failed:', e)}
      />

      {/* Cal.com */}
      <Script
        id="cal-com"
        strategy="afterInteractive"
        src="https://app.cal.com/embed/embed.js"
        onLoad={() => {
          console.log('✅ Cal.com script loaded')
          if (typeof window !== 'undefined' && window.Cal) {
            window.Cal('init', {
              origin: 'https://app.cal.com'
            })
            console.log('✅ Cal.com initialized via onLoad')
          }
        }}
        onError={(e) => console.error('❌ Cal.com script failed:', e)}
      />

      {/* Typeform */}
      <Script
        id="typeform"
        strategy="afterInteractive"
        src="https://embed.typeform.com/next/embed.js"
        onLoad={() => console.log('✅ Typeform script loaded')}
        onError={(e) => console.error('❌ Typeform script failed:', e)}
      />
    </>
  )
}

// Window 객체에 대한 타입 확장
declare global {
  interface Window {
    ChannelIO: any
    Cal: any
  }
} 
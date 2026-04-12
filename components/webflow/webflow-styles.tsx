'use client'

import { useEffect } from 'react'

const WF_BASE = '/webflow/orientalcalligraphy'

const STYLESHEETS = [
  `${WF_BASE}/css/normalize.css`,
  `${WF_BASE}/css/components.css`,
  `${WF_BASE}/css/orientalcalligraphy.css`,
]

export function WebflowStyles() {
  useEffect(() => {
    const links: HTMLLinkElement[] = []

    STYLESHEETS.forEach(href => {
      if (document.querySelector(`link[href="${href}"]`)) return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.dataset.webflow = 'true'
      document.head.appendChild(link)
      links.push(link)
    })

    return () => {
      links.forEach(link => link.remove())
    }
  }, [])

  return null
}

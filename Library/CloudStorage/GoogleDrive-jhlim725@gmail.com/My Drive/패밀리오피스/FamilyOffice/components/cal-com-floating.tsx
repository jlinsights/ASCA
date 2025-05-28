'use client'

/* First make sure that you have installed the package */
/* If you are using yarn */
// yarn add @calcom/embed-react

/* If you are using npm */
// npm install @calcom/embed-react

import { getCalApi } from "@calcom/embed-react"
import { useEffect } from "react"

export function CalComFloating() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ "namespace": "coffeechat" })
      cal("floatingButton", {
        "calLink": "familyoffice/coffeechat",
        "config": { "layout": "month_view" },
        "buttonPosition": "bottom-left"
      })
      cal("ui", {
        "cssVarsPerTheme": {
          "light": { "cal-brand": "#000000" },
          "dark": { "cal-brand": "#ffffff" }
        },
        "hideEventTypeDetails": false,
        "layout": "month_view"
      })
    })()
  }, [])

  return null
} 
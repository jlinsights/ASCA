"use client"

import { useLanguage } from "@/contexts/language-context"

interface TranslatedContentProps {
  textKey: string
}

export function TranslatedContent({ textKey }: TranslatedContentProps) {
  const { t } = useLanguage()
  return <>{t(textKey)}</>
}

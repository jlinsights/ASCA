import { archiveTranslations } from '@/lib/i18n/translations/archive'
import { translations } from '@/lib/i18n/translations'
it('registers all archive keys in every supported locale', () => {
  const keys = Object.keys(archiveTranslations.ko).sort()
  for (const lang of ['ko', 'en', 'ja', 'zh'] as const) {
    expect(Object.keys(archiveTranslations[lang]).sort()).toEqual(keys)
    for (const key of keys) expect(translations[lang]?.[key]).toBe(archiveTranslations[lang][key])
  }
})

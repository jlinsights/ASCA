import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo'

export function JsonLd() {
  const orgSchema = generateOrganizationSchema()
  const webSiteSchema = generateWebSiteSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(orgSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  )
}

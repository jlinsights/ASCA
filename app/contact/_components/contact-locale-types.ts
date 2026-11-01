// /contact 화면 문구의 모양 — 언어마다 같은 모양이어야 한다 (contact-locale.ts)

export interface SectionHead {
  eyebrow: string
  title: string
  lede?: string
}

export interface ContactCopy {
  hero: { title: string; lede: string; liveChat: string; facts: [string, string][] }
  newWindow: string
  tocLabel: string
  toc: {
    inquiry: string
    topics: string
    channels: string
    objection: string
    address: string
    events: string
    faq: string
  }
  topics: SectionHead & { items: { title: string; body: string; cta: string }[]; note: string }
  channels: SectionHead & {
    fastest: string
    /** CHANNELS 와 같은 순서. value 가 null 이면 원래 값(번호·주소)을 그대로 쓴다 */
    items: { title: string; value: string | null; bestFor: string }[]
  }
  objection: SectionHead & {
    fieldsHead: string
    fields: { term: string; detail: string }[]
    mailCta: string
    writtenNote: (email: string, phone: string) => string
    deadlineCaption: string
    deadlineColumns: [string, string, string]
    deadlines: [string, string, string][]
    extensionNote: string
    typesHead: string
    types: { title: string; body: string }[]
    dismissalsHead: string
    dismissals: string[]
    sources: string[]
  }
  address: SectionHead & {
    officeLabel: string
    headquartersLabel: string
    officeRole: string
    map: string
    sources: string[]
  }
  events: SectionHead
  faq: SectionHead
  citeLabel: string
}

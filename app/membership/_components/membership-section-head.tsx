interface MembershipSectionHeadProps {
  id: string
  title: string
  lede?: string
}

/** 섹션 머리 — 굵은 먹선 아래 왼쪽 정렬 제목. 페이지 전체가 같은 리듬으로 읽히게 한다 */
export function MembershipSectionHead({ id, title, lede }: MembershipSectionHeadProps) {
  return (
    <header className='asca-mb__head'>
      <h2 id={id} className='asca-mb__title'>
        {title}
      </h2>
      {lede && <p className='asca-mb__lede'>{lede}</p>}
    </header>
  )
}

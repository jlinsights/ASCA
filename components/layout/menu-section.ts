import { headerMenu, type MenuGroup, type MenuLink } from './site-menu'

// 페이지 머리 눈썹(ASCA · 메뉴 이름)과 01–0N 목차가 같은 판단을 쓴다 — 지금 주소가 어느 메뉴에 있나

/** 바깥 주소·빈 경로를 빼고 경로와 쿼리로 나눈다 */
function splitHref(href: string): { path: string; query: URLSearchParams } {
  const [path = '', search = ''] = href.split('?')
  return { path, query: new URLSearchParams(search) }
}

function internalItems(group: MenuGroup): MenuLink[] {
  return (group.items ?? []).filter(item => !item.external && item.href.startsWith('/'))
}

/** 메뉴 항목과 경로가 똑같은 묶음 — 목차를 보일 페이지 */
export function findMenuGroup(pathname: string | null | undefined): MenuGroup | undefined {
  if (!pathname) return undefined
  return headerMenu.find(group =>
    internalItems(group).some(item => splitHref(item.href).path === pathname)
  )
}

/**
 * 눈썹에 쓸 묶음 — 같은 경로가 없으면 항목 경로 아래 상세 페이지(/notice/12)도 그 묶음으로 본다.
 * 가장 긴 경로가 이긴다(/exhibitions/current 가 /exhibitions 보다 먼저).
 */
export function findMenuGroupForEyebrow(
  pathname: string | null | undefined
): MenuGroup | undefined {
  if (!pathname) return undefined
  const exact = findMenuGroup(pathname)
  if (exact) return exact

  let best: { group: MenuGroup; length: number } | undefined
  for (const group of headerMenu) {
    for (const item of internalItems(group)) {
      const { path } = splitHref(item.href)
      if (path.length > 1 && pathname.startsWith(`${path}/`)) {
        if (!best || path.length > best.length) best = { group, length: path.length }
      }
    }
  }
  return best?.group
}

/**
 * 지금 보고 있는 항목. 쿼리가 붙은 항목(/artists?membershipType=초대작가)이 맞으면 그것,
 * 아니면 쿼리 없는 같은 경로 항목(/artists). search 를 모르면(null) 쿼리 항목은 고르지 않는다.
 */
export function currentMenuHref(
  group: MenuGroup,
  pathname: string,
  search: URLSearchParams | null
): string | undefined {
  const items = internalItems(group)
  if (search) {
    const withQuery = items.find(item => {
      const { path, query } = splitHref(item.href)
      if (path !== pathname || [...query.keys()].length === 0) return false
      return [...query.entries()].every(([key, value]) => search.get(key) === value)
    })
    if (withQuery) return withQuery.href
  }
  return items.find(item => item.href === pathname)?.href
}

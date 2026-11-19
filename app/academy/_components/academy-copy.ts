import {
  ANAM,
  ASCA_BENEFIT,
  CURRICULUM,
  INSTITUTIONS,
  MUNWON_FACTS,
  MUNWON_FEATURES,
  SAC_CATEGORIES,
  SAC_CLASSES,
  SAC_DAYS,
  SAC_DISCOUNTS,
  SAC_FEES,
  SAC_SLOTS,
  SAC_TERM,
  SRC,
  SUBJECTS,
  type RegSource,
  type SacCategory,
  type SacDay,
} from './academy-data'

/**
 * 강좌 데이터의 언어별 글자.
 * 사실(수강료·시간·과정)의 원본은 academy-data.ts(한국어) 하나다 — 시간표 옮겨 적기 테스트가 그 파일을 본다.
 * 여기서는 그 글자마다 번역 키(ac.*)를 붙여 resolve(key, 한국어) 로 바꿔 끼운다.
 *  - 화면: resolve = (key) => t(key)  — ko 표에도 같은 한국어가 들어 있다
 *  - 테스트: resolve 가 (key, 한국어) 를 모아 ko 표와 견준다 — 한국어가 바뀌면 번역도 다시 보라고 실패한다
 *
 * 번역하지 않는 것(UNTRANSLATED): 사람 이름(강사·지도 교수), 작품·영상 제목, 지도 교수의 소속 단체 이름,
 * 도로명 주소(지도 링크와 맞춘다), 전화번호·시각. 시간표의 분야·요일 값은 CSS(data-cat)와 필터가 쓰는 id 라 그대로 두고 이름만 바꾼다.
 */
export type Resolve = (key: string, ko: string) => string

const ADDRESS_LABEL = '장소'

/** 어느 언어 화면에서도 원문(한국어) 그대로 보이는 글자 — 렌더 테스트가 이것만 한글로 허용한다 */
export const UNTRANSLATED: readonly string[] = [
  ...new Set([
    ...SAC_CLASSES.map(item => item.instructor),
    ANAM.name,
    ...ANAM.activities,
    ...ANAM.artworks.map(work => work.title),
    ...ANAM.videos.map(video => video.title),
    ...MUNWON_FACTS.filter(fact => fact.label === ADDRESS_LABEL).map(fact => fact.value),
  ]),
]

export function localizeAcademy(resolve: Resolve) {
  const r = (key: string, ko: string) => resolve(`ac.${key}`, ko)
  const list = (key: string, items: readonly string[]) =>
    items.map((item, index) => r(`${key}.${index + 1}`, item))
  const src = (name: keyof typeof SRC): RegSource => ({
    ...SRC[name],
    label: r(`src.${name}`, SRC[name].label),
  })
  const dayIndex = (day: SacDay) => SAC_DAYS.indexOf(day) + 1
  const catIndex = (category: SacCategory) => SAC_CATEGORIES.indexOf(category) + 1

  return {
    src: { articles3: src('articles3'), articles4: src('articles4') },
    institutions: INSTITUTIONS.map((item, index) => ({
      ...item,
      name: r(`inst.${index + 1}.name`, item.name),
      role: r(`inst.${index + 1}.role`, item.role),
      body: r(`inst.${index + 1}.body`, item.body),
    })),
    subjects: SUBJECTS.map((item, index) => ({
      ...item,
      title: r(`subject.${index + 1}.title`, item.title),
      description: r(`subject.${index + 1}.body`, item.description),
    })),
    curriculum: CURRICULUM.map((track, t) => ({
      ...track,
      title: r(`track.${t + 1}.title`, track.title),
      levels: track.levels.map((level, l) => ({
        stage: r(`track.${t + 1}.level.${l + 1}.stage`, level.stage),
        label: r(`track.${t + 1}.level.${l + 1}.label`, level.label),
        items: list(`track.${t + 1}.level.${l + 1}.item`, level.items),
      })),
    })),
    munwonFacts: MUNWON_FACTS.map((fact, index) => ({
      ...fact,
      label: r(`munwon.${index + 1}.label`, fact.label),
      value: fact.label === ADDRESS_LABEL ? fact.value : r(`munwon.${index + 1}.value`, fact.value),
      note: fact.note ? r(`munwon.${index + 1}.note`, fact.note) : undefined,
    })),
    munwonFeatures: list('munwonFeature', MUNWON_FEATURES),
    anam: {
      ...ANAM,
      title: r('anam.title', ANAM.title),
      role: r('anam.role', ANAM.role),
      career: list('anam.career', ANAM.career),
      exhibitions: list('anam.exhibition', ANAM.exhibitions),
    },
    term: {
      ...SAC_TERM,
      name: r('term.name', SAC_TERM.name),
      period: r('term.period', SAC_TERM.period),
      length: r('term.length', SAC_TERM.length),
      recess: r('term.recess', SAC_TERM.recess),
      place: r('term.place', SAC_TERM.place),
      format: r('term.format', SAC_TERM.format),
      contactHours: r('term.contactHours', SAC_TERM.contactHours),
    },
    fees: SAC_FEES.map((fee, index) => ({
      label: r(`fee.${index + 1}.label`, fee.label),
      amount: r(`fee.${index + 1}.amount`, fee.amount),
    })),
    discounts: list('discount', SAC_DISCOUNTS),
    benefit: {
      headline: r('benefit.headline', ASCA_BENEFIT.headline),
      items: ASCA_BENEFIT.items.map((item, index) => ({
        label: r(`benefit.${index + 1}.label`, item.label),
        value: r(`benefit.${index + 1}.value`, item.value),
      })),
    },
    dayLabel: (day: SacDay) => r(`day.${dayIndex(day)}`, day),
    slots: SAC_SLOTS.map((slot, index) => ({ ...slot, label: r(`slot.${index + 1}`, slot.label) })),
    categoryLabel: (category: SacCategory) => r(`cat.${catIndex(category)}`, category),
    classTitle: (index: number) => r(`class.${index + 1}`, SAC_CLASSES[index]?.title ?? ''),
  }
}

export type AcademyCopy = ReturnType<typeof localizeAcademy>

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function academyDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  const copy = localizeAcademy((key, ko) => {
    strings[key] = ko
    return ko
  })
  // 함수로 꺼내는 이름(요일·분야·강좌 제목)도 모두 한 번씩 불러 키를 모은다
  SAC_DAYS.forEach(day => copy.dayLabel(day))
  SAC_CATEGORIES.forEach(category => copy.categoryLabel(category))
  SAC_CLASSES.forEach((_, index) => copy.classTitle(index))
  return strings
}

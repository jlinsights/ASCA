// 마사이크 레이아웃을 위한 헬퍼 함수들

export const getRandomAspectRatio = (index: number) => {
  const ratios = ['1/1', '4/5', '3/4', '5/4', '16/9']
  return ratios[index % ratios.length]
}

export const getCategoryIcon = (category: string) => {
  const icons = {
    committee: '👥',
    contest: '🏆',
    invited: '🎨',
    nominee: '⭐',
    exhibition: '🖼️',
    workshop: '📚',
    group: '👨‍👩‍👧‍👦',
    award: '🏅',
    ceremony: '🎉',
    event: '📸',
    people: '👤',
    sac: '🏛️',
  }
  return icons[category as keyof typeof icons] || '📷'
}

export const getCategoryName = (category: string) => {
  const names = {
    committee: '심사위원회',
    contest: '휘호대회',
    invited: '초대작가',
    nominee: '추천작가',
    exhibition: '전시회',
    workshop: '워크샵',
    group: '단체사진',
    award: '시상기념',
    ceremony: '개막식 및 시상식',
    event: '행사 이모저모',
    people: '인물/참석자',
    sac: '전시장 풍경',
  }
  return names[category as keyof typeof names] || '기타'
}

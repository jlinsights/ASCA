import { membershipTiers } from './membership-data'

export const getTierInfo = (tierLevel: number) => {
  const tier = membershipTiers.find(t => t.level === tierLevel)
  return tier || membershipTiers[0]
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    case 'pending_approval':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    case 'suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '활성'
    case 'pending_approval':
      return '승인 대기'
    case 'inactive':
      return '비활성'
    case 'suspended':
      return '정지'
    default:
      return status
  }
}

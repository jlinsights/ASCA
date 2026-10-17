import { membershipTiers } from './membership-data'

export const getTierInfo = (tierLevel: number) => {
  const tier = membershipTiers.find(t => t.level === tierLevel)
  return tier || membershipTiers[0]
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-foreground'
    case 'pending_approval':
      return 'bg-warning/10 text-foreground'
    case 'inactive':
      return 'bg-muted text-foreground'
    case 'suspended':
      return 'bg-seal/10 text-foreground'
    default:
      return 'bg-muted text-foreground'
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

/**
 * 아이콘 크기 상수 및 공통 조합
 */

import { AlertCircle, Check, Info, Loader2, X } from './re-exports'
import { ActionIcons, MediaIcons, NavigationIcons, StatusIcons, UIIcons } from './groups'

export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const

export const CommonIconCombos = {
  loading: { icon: Loader2, className: 'animate-spin' },
  success: { icon: Check, className: 'text-green-500' },
  error: { icon: X, className: 'text-red-500' },
  warning: { icon: AlertCircle, className: 'text-yellow-500' },
  info: { icon: Info, className: 'text-blue-500' },
} as const

export const IconComponents = {
  Navigation: NavigationIcons,
  Action: ActionIcons,
  Media: MediaIcons,
  UI: UIIcons,
  Status: StatusIcons,
  Sizes: ICON_SIZES,
  Combos: CommonIconCombos,
}

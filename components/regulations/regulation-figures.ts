import type { StaticImageData } from 'next/image'
import form1 from '@/regulations/assets/05-certificate-form-1.png'
import form2 from '@/regulations/assets/05-certificate-form-2.png'
import form3 from '@/regulations/assets/05-certificate-form-3.png'

// regulations/ 는 public/ 밖이라 정적 import 로 번들에 싣는다 — 크기(width/height)도 함께 온다.
// 새 그림을 넣으면 lib/regulations/catalog.ts 의 REGULATION_ASSETS 에도 같은 이름을 더한다.
export const REGULATION_FIGURES: Readonly<Record<string, StaticImageData>> = {
  '05-certificate-form-1.png': form1,
  '05-certificate-form-2.png': form2,
  '05-certificate-form-3.png': form3,
}

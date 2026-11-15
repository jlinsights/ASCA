'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import type {
  Quote,
  QuoteError,
  QuoteResult,
  SeparateQuoteReason,
} from '@/lib/catalog-quote/calculate'

const ERROR_TEXT: Record<QuoteError, string> = {
  INVALID_INPUT: '입력값을 다시 확인해 주세요.',
  WORKS_NOT_INTEGER: '승인 출품 수는 정수로 입력해 주세요.',
  WORKS_BELOW_MINIMUM: '개인전·부스전은 승인 작품이 10점 이상이어야 합니다.',
  COPIES_NOT_INTEGER: '추가 부수는 정해진 선택지에서 골라 주세요.',
  COPIES_NOT_OPTION: '추가 부수는 100~500부, 50부 단위로만 고를 수 있습니다.',
  COPIES_ABOVE_MAXIMUM: '500부를 넘는 수량은 사무국 별도 견적으로 안내합니다.',
}

const SEPARATE_TEXT: Record<SeparateQuoteReason, string> = {
  MIXED_MEMBERSHIP: '정회원과 비회원이 함께 참여',
  SPLIT_DELIVERY: '여러 곳으로 나누어 납품',
  MULTIPLE_EDITIONS: '여러 판본',
}

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`

interface Props {
  paidOptions: number[]
  policyVersion: string
  approved: boolean
}

export function CatalogQuoteCalculator({ paidOptions, policyVersion, approved }: Props) {
  const [applicationType, setApplicationType] = useState<'solo' | 'groupBooth'>('solo')
  const [membership, setMembership] = useState<'member' | 'nonMember' | 'mixed'>('member')
  const [works, setWorks] = useState('20')
  const [paid, setPaid] = useState('100')
  const [noOrder, setNoOrder] = useState(false)
  const [splitDelivery, setSplitDelivery] = useState(false)
  const [multipleEditions, setMultipleEditions] = useState(false)
  const [result, setResult] = useState<QuoteResult | null>(null)
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)

  const group = applicationType === 'groupBooth'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setFailed(false)
    try {
      const response = await fetch('/api/catalog-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationType,
          membership: group ? membership : membership === 'mixed' ? 'member' : membership,
          // 공란은 그대로 보내 서버가 오류로 돌려준다
          approvedWorks: works.trim() === '' ? null : Number(works),
          paidCopies: noOrder ? 0 : Number(paid),
          splitDelivery: group && splitDelivery,
          multipleEditions: group && multipleEditions,
        }),
      })
      if (response.status !== 200 && response.status !== 422) throw new Error('unavailable')
      setResult((await response.json()) as QuoteResult)
    } catch {
      setFailed(true)
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className='mt-8 space-y-8'>
      <form onSubmit={submit} className='space-y-6 rounded-md border border-border p-6'>
        <fieldset>
          <legend className='mb-2 text-sm font-semibold text-foreground'>신청 유형</legend>
          <div className='flex flex-wrap gap-4 text-sm'>
            {(
              [
                ['solo', '개인전'],
                ['groupBooth', '서예단체 부스전'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className='inline-flex min-h-11 items-center gap-2'>
                <input
                  type='radio'
                  name='applicationType'
                  value={value}
                  checked={applicationType === value}
                  onChange={() => setApplicationType(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className='grid gap-6 sm:grid-cols-2'>
          <label className='block text-sm'>
            <span className='mb-1 block font-semibold text-foreground'>회원 구분</span>
            <select
              className='min-h-11 w-full rounded-md border border-input bg-background px-3'
              value={membership}
              onChange={event => setMembership(event.target.value as typeof membership)}
            >
              <option value='member'>정회원</option>
              <option value='nonMember'>비회원</option>
              {group && <option value='mixed'>정회원·비회원 혼합</option>}
            </select>
          </label>

          <div className='text-sm'>
            <label htmlFor='quote-works' className='mb-1 block font-semibold text-foreground'>
              승인 출품 수 (점)
            </label>
            <input
              id='quote-works'
              className='min-h-11 w-full rounded-md border border-input bg-background px-3'
              inputMode='numeric'
              value={works}
              onChange={event => setWorks(event.target.value)}
              aria-describedby='works-hint'
            />
            <p id='works-hint' className='mt-1 text-xs text-muted-foreground'>
              10점 이상, 정수
            </p>
          </div>

          <div className='text-sm sm:col-span-2'>
            <label htmlFor='quote-paid' className='mb-1 block font-semibold text-foreground'>
              추가 유료 도록 부수
            </label>
            <select
              id='quote-paid'
              aria-describedby='quote-paid-hint'
              disabled={noOrder}
              className='min-h-11 w-full rounded-md border border-input bg-background px-3'
              value={paid}
              onChange={event => setPaid(event.target.value)}
            >
              {paidOptions.map(option => (
                <option key={option} value={option}>
                  {option}부
                </option>
              ))}
            </select>
            <label className='mt-2 flex min-h-11 items-center gap-2'>
              <input
                type='checkbox'
                checked={noOrder}
                onChange={event => setNoOrder(event.target.checked)}
              />
              추가 유료 도록 주문 안 함
            </label>
            <p id='quote-paid-hint' className='mt-1 text-xs text-muted-foreground'>
              정회원은 승인 작품 1점당 1부를 무료로 받습니다(공동 도록 1권과 중복 없음). 500부를
              넘는 수량은 별도 견적입니다.
            </p>
          </div>
        </div>

        {group && (
          <fieldset className='space-y-2 text-sm'>
            <legend className='mb-1 font-semibold text-foreground'>단체 주문 조건</legend>
            <label className='flex min-h-11 items-center gap-2'>
              <input
                type='checkbox'
                checked={splitDelivery}
                onChange={event => setSplitDelivery(event.target.checked)}
              />
              여러 곳으로 나누어 납품
            </label>
            <label className='flex min-h-11 items-center gap-2'>
              <input
                type='checkbox'
                checked={multipleEditions}
                onChange={event => setMultipleEditions(event.target.checked)}
              />
              여러 판본
            </label>
          </fieldset>
        )}

        <Button type='submit' disabled={pending}>
          {pending ? '계산 중…' : '가견적 계산'}
        </Button>
      </form>

      <section aria-live='polite' aria-label='가견적 결과'>
        {failed && (
          <p role='alert' className='text-sm text-destructive'>
            지금은 계산할 수 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}
        {result && !result.ok && result.status === 'invalid' && (
          <ul role='alert' className='list-disc space-y-1 pl-5 text-sm text-destructive'>
            {result.errors.map(code => (
              <li key={code}>{ERROR_TEXT[code]}</li>
            ))}
          </ul>
        )}
        {result && !result.ok && result.status === 'separateQuote' && (
          <div className='rounded-md border border-border p-6 text-sm'>
            <h2 className='font-serif text-xl font-bold text-foreground'>별도 견적 대상</h2>
            <p className='mt-2 text-muted-foreground'>
              다음 조건은 자동으로 계산하지 않고 사무국이 별도로 견적합니다:{' '}
              {result.reasons.map(reason => SEPARATE_TEXT[reason]).join(', ')}.
            </p>
          </div>
        )}
        {result && result.ok && (
          <QuoteView quote={result.quote} policyVersion={policyVersion} approved={approved} />
        )}
      </section>
    </div>
  )
}

function QuoteView({
  quote,
  policyVersion,
  approved,
}: {
  quote: Quote
  policyVersion: string
  approved: boolean
}) {
  const { catalog } = quote
  const rows: [string, string][] = [
    [
      '출품비 (표구비 제외)',
      `${won(quote.entryFee.amount)} (작품당 ${won(quote.entryFee.unitPrice)})`,
    ],
    ['무료 제공 부수', `${catalog.freeCopies.toLocaleString('ko-KR')}부`],
    ['추가 유료 부수', `${catalog.paidCopies.toLocaleString('ko-KR')}부`],
    ['총 인쇄 기준 부수', `${catalog.totalPrintRun.toLocaleString('ko-KR')}부`],
    ['도록 대금', won(catalog.amount)],
  ]
  if (catalog.averagePaidUnit !== null)
    rows.push(['유료 평균 단가', `${won(catalog.averagePaidUnit)} / 부`])
  rows.push(['출품비 + 도록 대금', won(quote.totalExcludingExtras)])

  return (
    <div className='rounded-md border border-border p-6'>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='font-serif text-xl font-bold text-foreground'>가견적</h2>
        <span className='text-xs text-muted-foreground'>
          {approved ? '이사회 의결 기준' : '검토안 · 확정 금액 아님'} · 회원 자격 미확인 (신고 기준)
          · {policyVersion}
        </span>
      </div>
      <dl className='mt-4 divide-y divide-border text-sm'>
        {rows.map(([label, value]) => (
          <div key={label} className='flex justify-between gap-4 py-2'>
            <dt className='text-muted-foreground'>{label}</dt>
            <dd className='text-right font-medium tabular-nums text-foreground'>{value}</dd>
          </div>
        ))}
      </dl>
      {catalog.blocks.length > 0 && (
        <table className='mt-6 w-full text-sm'>
          <caption className='mb-2 text-left text-xs text-muted-foreground'>
            부수 구간별 단가 (구간 할인은 그 구간 부수에만 적용)
          </caption>
          <thead>
            <tr className='text-left text-muted-foreground'>
              <th className='py-1 font-normal'>순번</th>
              <th className='py-1 text-right font-normal'>부수</th>
              <th className='py-1 text-right font-normal'>할인</th>
              <th className='py-1 text-right font-normal'>단가</th>
              <th className='py-1 text-right font-normal'>금액</th>
            </tr>
          </thead>
          <tbody className='tabular-nums'>
            {catalog.blocks.map(block => (
              <tr key={block.from} className='border-t border-border'>
                <td className='py-1'>
                  {block.from}~{block.to ?? ''}번째
                </td>
                <td className='py-1 text-right'>{block.quantity}부</td>
                <td className='py-1 text-right'>{block.rateBp / 100}%</td>
                <td className='py-1 text-right'>{won(block.unitPrice)}</td>
                <td className='py-1 text-right'>{won(block.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className='mt-6 text-xs text-muted-foreground'>
        포함되지 않은 항목: {quote.excluded.join(' · ')}. 납기·배송·부가세·재출력 조건은 사무국 안내
        후 확정합니다.
      </p>
    </div>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import type { ComparisonAnalysis } from './types'

interface AnalysisPanelProps {
  showAnalysis: boolean
  analysis: ComparisonAnalysis | null
  onClose: () => void
}

export function AnalysisPanel({ showAnalysis, analysis, onClose }: AnalysisPanelProps) {
  if (!showAnalysis || !analysis) return null

  return (
    <Card className='mt-6 border-temple-gold/30'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='font-calligraphy text-lg flex items-center gap-2'>
            <BookOpen className='w-5 h-5 text-temple-gold' />
            Comparative Analysis
          </CardTitle>
          <Button
            size='sm'
            variant='outline'
            onClick={onClose}
            className='border-ink-black/20'
            aria-label='Close analysis panel'
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Similarities */}
        <div>
          <h4 className='font-semibold text-ink-black mb-3'>Similarities</h4>
          <ul className='space-y-2'>
            {analysis.similarities.map(similarity => (
              <li key={similarity} className='flex items-start gap-2 text-sm'>
                <div className='w-2 h-2 bg-summer-jade rounded-full mt-2 flex-shrink-0' />
                <span className='text-ink-black/80'>{similarity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differences */}
        <div>
          <h4 className='font-semibold text-ink-black mb-3'>Key Differences</h4>
          <ul className='space-y-2'>
            {analysis.differences.map(difference => (
              <li key={difference} className='flex items-start gap-2 text-sm'>
                <div className='w-2 h-2 bg-vermillion rounded-full mt-2 flex-shrink-0' />
                <span className='text-ink-black/80'>{difference}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Analysis */}
        <div>
          <h4 className='font-semibold text-ink-black mb-3'>Technical Analysis</h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-celadon-green/10 rounded-lg p-3'>
              <h5 className='font-medium text-ink-black mb-2'>Brushwork</h5>
              <p className='text-sm text-ink-black/80'>{analysis.techniques.brushwork}</p>
            </div>
            <div className='bg-temple-gold/10 rounded-lg p-3'>
              <h5 className='font-medium text-ink-black mb-2'>Composition</h5>
              <p className='text-sm text-ink-black/80'>{analysis.techniques.composition}</p>
            </div>
            <div className='bg-autumn-gold/10 rounded-lg p-3'>
              <h5 className='font-medium text-ink-black mb-2'>Style</h5>
              <p className='text-sm text-ink-black/80'>{analysis.techniques.style}</p>
            </div>
          </div>
        </div>

        {/* Cultural Context */}
        <div className='bg-silk-cream/50 rounded-lg p-4'>
          <h4 className='font-semibold text-ink-black mb-3'>Cultural Context</h4>
          <p className='text-sm text-ink-black/80 leading-relaxed'>{analysis.cultural_context}</p>
        </div>

        {/* Educational Notes */}
        {analysis.educational_notes.length > 0 && (
          <div>
            <h4 className='font-semibold text-ink-black mb-3'>Educational Notes</h4>
            <div className='space-y-2'>
              {analysis.educational_notes.map(note => (
                <div key={note} className='bg-temple-gold/10 rounded-md p-3'>
                  <p className='text-sm text-ink-black/80'>{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

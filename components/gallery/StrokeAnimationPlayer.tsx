'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brush, Info, BookOpen, Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StrokeAnimationPlayerProps } from './stroke-animation/types'
import { useStrokeAnimation } from './stroke-animation/use-stroke-animation'
import { PlaybackControls } from './stroke-animation/playback-controls'
import { SettingsPanel } from './stroke-animation/settings-panel'

// ===============================
// Main Component (shell)
// ===============================

function StrokeAnimationPlayer({
  strokes,
  educationalContent,
  characterImage,
  onStrokeComplete,
  onAnimationComplete,
  className,
}: StrokeAnimationPlayerProps) {
  const {
    canvasRef,
    canvasWidth,
    canvasHeight,
    playbackState,
    settings,
    setSettings,
    showSettings,
    setShowSettings,
    showEducational,
    setShowEducational,
    setCurrentQuizQuestion,
    isFullscreen,
    setIsFullscreen,
    play,
    pause,
    stop,
    nextStroke,
    previousStroke,
  } = useStrokeAnimation({ strokes, characterImage, onStrokeComplete, onAnimationComplete })

  // ===============================
  // Render Functions
  // ===============================

  const renderProgressBar = () => (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-ink-black/70'>
          Stroke {playbackState.currentStroke + 1} of {strokes.length}
        </span>
        <span className='text-ink-black/70'>{(playbackState.totalProgress * 100).toFixed(1)}%</span>
      </div>
      <Progress value={playbackState.totalProgress * 100} className='h-2' />

      {strokes[playbackState.currentStroke] && (
        <div className='text-xs text-ink-black/60'>
          <Progress value={playbackState.currentProgress * 100} className='h-1 opacity-60' />
        </div>
      )}
    </div>
  )

  const renderStrokeInfo = () => {
    const currentStroke = strokes[playbackState.currentStroke]
    if (!currentStroke) return null

    return (
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Brush className='w-4 h-4 text-celadon-green' />
            Stroke {playbackState.currentStroke + 1} Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-ink-black/70'>Duration:</span>
                <span className='ml-2 font-medium'>{currentStroke.duration}s</span>
              </div>
              <div>
                <span className='text-ink-black/70'>Points:</span>
                <span className='ml-2 font-medium'>{currentStroke.points.length}</span>
              </div>
              <div>
                <span className='text-ink-black/70'>Brush:</span>
                <span className='ml-2 font-medium'>{currentStroke.brush_type}</span>
              </div>
              <div>
                <span className='text-ink-black/70'>Position:</span>
                <span className='ml-2 font-medium'>
                  {currentStroke.character_position || 'N/A'}
                </span>
              </div>
            </div>

            {currentStroke.educational_notes.length > 0 && (
              <div>
                <h4 className='font-medium text-ink-black mb-2'>Educational Notes:</h4>
                <ul className='space-y-1'>
                  {currentStroke.educational_notes.map((note, index) => (
                    <li key={index} className='text-sm text-ink-black/80 flex items-start gap-2'>
                      <div className='w-1.5 h-1.5 bg-celadon-green rounded-full mt-2 flex-shrink-0' />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEducationalContent = () => {
    if (!showEducational || !educationalContent) return null

    return (
      <Card className='mt-4 border-temple-gold/30'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base flex items-center gap-2'>
              <BookOpen className='w-4 h-4 text-temple-gold' />
              Educational Content
            </CardTitle>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowEducational(false)}
              className='border-ink-black/20'
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {educationalContent.stroke_analysis?.technique_breakdown && (
            <div>
              <h4 className='font-medium text-ink-black mb-3'>Technique Breakdown</h4>
              <div className='space-y-3'>
                {educationalContent.stroke_analysis.technique_breakdown.map((technique, index) => (
                  <div key={index} className='bg-temple-gold/10 rounded-lg p-3'>
                    <h5 className='font-medium text-ink-black mb-2'>{technique.technique_name}</h5>
                    <p className='text-sm text-ink-black/80 mb-2'>{technique.description}</p>
                    {technique.key_points.length > 0 && (
                      <ul className='text-xs text-ink-black/70 space-y-1'>
                        {technique.key_points.map((point, pointIndex) => (
                          <li key={pointIndex} className='flex items-start gap-2'>
                            <div className='w-1 h-1 bg-temple-gold rounded-full mt-1.5 flex-shrink-0' />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {educationalContent.interactive_elements?.quiz_questions && (
            <div>
              <h4 className='font-medium text-ink-black mb-3'>Practice Quiz</h4>
              <Button
                onClick={() => setCurrentQuizQuestion(0)}
                className='bg-temple-gold text-ink-black hover:bg-temple-gold/80'
              >
                Start Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderCanvas = () => (
    <div className='relative bg-ink-black/5 rounded-lg overflow-hidden'>
      <canvas
        ref={canvasRef}
        className='w-full h-auto border border-celadon-green/20 rounded-lg bg-rice-paper'
        style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
      />

      {/* Overlay controls */}
      <div className='absolute top-4 right-4 flex gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setShowEducational(!showEducational)}
          className='bg-silk-cream/90 backdrop-blur-sm border-ink-black/20'
        >
          <Info className='w-4 h-4' />
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setIsFullscreen(!isFullscreen)}
          className='bg-silk-cream/90 backdrop-blur-sm border-ink-black/20'
        >
          {isFullscreen ? <Minimize className='w-4 h-4' /> : <Maximize className='w-4 h-4' />}
        </Button>
      </div>

      {/* Stroke counter overlay */}
      <div className='absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1'>
        <span className='text-sm font-medium text-ink-black'>
          Stroke {playbackState.currentStroke + 1} / {strokes.length}
        </span>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'space-y-4',
        isFullscreen && 'fixed inset-0 z-50 bg-rice-paper p-6 overflow-auto',
        className
      )}
    >
      {/* Header */}
      <div className='text-center'>
        <h2 className='font-calligraphy text-xl font-bold text-ink-black mb-2'>
          Stroke Animation Player
        </h2>
        <p className='text-ink-black/70'>
          Learn traditional calligraphy through animated brush stroke demonstrations
        </p>
      </div>

      {/* Main Canvas */}
      {renderCanvas()}

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Playback Controls */}
      <PlaybackControls
        playbackState={playbackState}
        strokesCount={strokes.length}
        settings={settings}
        setSettings={setSettings}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onPrevious={previousStroke}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onNext={nextStroke}
      />

      {/* Settings Panel */}
      <SettingsPanel showSettings={showSettings} settings={settings} setSettings={setSettings} />

      {/* Stroke Information */}
      {renderStrokeInfo()}

      {/* Educational Content */}
      {renderEducationalContent()}
    </div>
  )
}

export default StrokeAnimationPlayer

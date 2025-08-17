'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Brush,
  MousePointer,
  Clock,
  Target,
  Layers,
  Info,
  Download,
  Share2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  StrokeAnimation, 
  TechniqueBreakdown, 
  EducationalContent,
  QuizQuestion 
} from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface AnimationSettings {
  playbackSpeed: number;
  showPressure: boolean;
  showDirection: boolean;
  showTiming: boolean;
  loopMode: 'none' | 'single' | 'all';
  autoAdvance: boolean;
  soundEnabled: boolean;
}

interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
  direction?: number; // angle in radians
}

interface AnimatedStroke {
  id: string;
  character_position?: string;
  points: StrokePoint[];
  duration: number;
  brush_type: string;
  ink_flow: number[];
  educational_notes: string[];
}

interface StrokeAnimationPlayerProps {
  strokes: AnimatedStroke[];
  educationalContent?: EducationalContent;
  characterImage?: string;
  onStrokeComplete?: (strokeIndex: number) => void;
  onAnimationComplete?: () => void;
  className?: string;
}

interface PlaybackState {
  isPlaying: boolean;
  currentStroke: number;
  currentProgress: number; // 0-1
  totalProgress: number; // 0-1
  isComplete: boolean;
}

// ===============================
// Main Component
// ===============================

const StrokeAnimationPlayer: React.FC<StrokeAnimationPlayerProps> = ({
  strokes,
  educationalContent,
  characterImage,
  onStrokeComplete,
  onAnimationComplete,
  className
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStroke: 0,
    currentProgress: 0,
    totalProgress: 0,
    isComplete: false
  });

  const [settings, setSettings] = useState<AnimationSettings>({
    playbackSpeed: 1,
    showPressure: true,
    showDirection: true,
    showTiming: false,
    loopMode: 'none',
    autoAdvance: true,
    soundEnabled: false
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showEducational, setShowEducational] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Animation dimensions
  const canvasWidth = 800;
  const canvasHeight = 600;

  // ===============================
  // Animation Engine
  // ===============================

  const initializeAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background character if available
    if (characterImage) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.1;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        ctx.globalAlpha = 1;
      };
      img.src = characterImage;
    }

    // Draw grid if enabled
    if (settings.showTiming) {
      drawGrid(ctx);
    }
  }, [characterImage, settings.showTiming]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawStroke = useCallback((
    ctx: CanvasRenderingContext2D,
    stroke: AnimatedStroke,
    progress: number
  ) => {
    if (stroke.points.length === 0) return;

    const totalPoints = stroke.points.length;
    const currentPointIndex = Math.floor(totalPoints * progress);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw completed portion of stroke
    for (let i = 0; i < currentPointIndex - 1; i++) {
      const point1 = stroke.points[i];
      const point2 = stroke.points[i + 1];
      
      // Safety check for undefined points
      if (!point1 || !point2) continue;

      // Calculate line width based on pressure
      const pressure1 = settings.showPressure ? point1.pressure : 0.5;
      const pressure2 = settings.showPressure ? point2.pressure : 0.5;
      const avgPressure = (pressure1 + pressure2) / 2;
      const lineWidth = Math.max(2, avgPressure * 20);

      // Calculate ink flow
      const inkFlow = stroke.ink_flow[i] || 1;
      const alpha = Math.min(1, 0.7 + (inkFlow * 0.3));

      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(point1.x * canvasWidth, point1.y * canvasHeight);
      ctx.lineTo(point2.x * canvasWidth, point2.y * canvasHeight);
      ctx.stroke();

      // Draw pressure indicator
      if (settings.showPressure && pressure1 > 0.8) {
        ctx.fillStyle = `rgba(255, 0, 0, ${(pressure1 - 0.8) * 2})`;
        ctx.beginPath();
        ctx.arc(point1.x * canvasWidth, point1.y * canvasHeight, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw direction arrow
      if (settings.showDirection && point1.direction !== undefined) {
        drawDirectionArrow(ctx, point1, lineWidth);
      }
    }

    // Draw current brush position
    if (currentPointIndex < totalPoints) {
      const currentPoint = stroke.points[currentPointIndex];
      
      // Safety check for undefined point
      if (!currentPoint) return;
      
      const pressure = settings.showPressure ? currentPoint.pressure : 0.5;
      const brushSize = Math.max(4, pressure * 24);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(
        currentPoint.x * canvasWidth, 
        currentPoint.y * canvasHeight, 
        brushSize / 2, 
        0, 
        2 * Math.PI
      );
      ctx.fill();

      // Brush tip indicator
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(
        currentPoint.x * canvasWidth, 
        currentPoint.y * canvasHeight, 
        2, 
        0, 
        2 * Math.PI
      );
      ctx.fill();
    }
  }, [settings.showPressure, settings.showDirection]);

  const drawDirectionArrow = (
    ctx: CanvasRenderingContext2D,
    point: StrokePoint,
    lineWidth: number
  ) => {
    if (point.direction === undefined) return;

    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;
    const arrowLength = lineWidth * 1.5;

    ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
    ctx.lineWidth = 2;

    // Draw arrow line
    const endX = x + Math.cos(point.direction) * arrowLength;
    const endY = y + Math.sin(point.direction) * arrowLength;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrow head
    const headSize = 4;
    const angle1 = point.direction + Math.PI * 0.8;
    const angle2 = point.direction - Math.PI * 0.8;

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + Math.cos(angle1) * headSize, endY + Math.sin(angle1) * headSize);
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX + Math.cos(angle2) * headSize, endY + Math.sin(angle2) * headSize);
    ctx.stroke();
  };

  // ===============================
  // Playback Controls
  // ===============================

  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current || strokes.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) * settings.playbackSpeed;
    const currentStroke = strokes[playbackState.currentStroke];
    
    if (!currentStroke) return;

    const strokeProgress = Math.min(1, elapsed / (currentStroke.duration * 1000));
    
    // Clear canvas and redraw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Redraw background
    if (characterImage) {
      const img = new Image();
      img.src = characterImage;
      if (img.complete) {
        ctx.globalAlpha = 0.1;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        ctx.globalAlpha = 1;
      }
    }

    if (settings.showTiming) {
      drawGrid(ctx);
    }

    // Draw previous completed strokes
    for (let i = 0; i < playbackState.currentStroke; i++) {
      drawStroke(ctx, strokes[i], 1);
    }

    // Draw current stroke
    drawStroke(ctx, currentStroke, strokeProgress);

    // Update state
    const totalDuration = strokes.reduce((sum, stroke) => sum + stroke.duration, 0);
    const completedDuration = strokes.slice(0, playbackState.currentStroke)
      .reduce((sum, stroke) => sum + stroke.duration, 0);
    const currentStrokeDuration = strokeProgress * currentStroke.duration;
    const totalProgress = (completedDuration + currentStrokeDuration) / totalDuration;

    setPlaybackState(prev => ({
      ...prev,
      currentProgress: strokeProgress,
      totalProgress
    }));

    // Check if stroke is complete
    if (strokeProgress >= 1) {
      onStrokeComplete?.(playbackState.currentStroke);

      if (playbackState.currentStroke < strokes.length - 1) {
        // Move to next stroke
        if (settings.autoAdvance) {
          setPlaybackState(prev => ({
            ...prev,
            currentStroke: prev.currentStroke + 1
          }));
          startTimeRef.current = timestamp;
        } else {
          // Pause at end of stroke
          setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        }
      } else {
        // Animation complete
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
          isComplete: true
        }));
        onAnimationComplete?.();

        if (settings.loopMode === 'all') {
          // Reset and restart animation
          setTimeout(() => {
            setPlaybackState({
              isPlaying: false,
              currentStroke: 0,
              currentProgress: 0,
              totalProgress: 0,
              isComplete: false
            });
            startTimeRef.current = undefined;
            
            setTimeout(() => {
              setPlaybackState(prev => ({ ...prev, isPlaying: true }));
              animationRef.current = requestAnimationFrame(animate);
            }, 100);
          }, 1000);
        }
      }
    }

    if (playbackState.isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [
    strokes, 
    playbackState.currentStroke, 
    playbackState.isPlaying,
    settings.playbackSpeed, 
    settings.autoAdvance, 
    settings.loopMode,
    settings.showTiming,
    characterImage,
    drawStroke,
    onStrokeComplete,
    onAnimationComplete
  ]);

  const resetAnimation = useCallback(() => {
    setPlaybackState({
      isPlaying: false,
      currentStroke: 0,
      currentProgress: 0,
      totalProgress: 0,
      isComplete: false
    });
    startTimeRef.current = undefined;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (playbackState.isComplete && settings.loopMode === 'none') {
      resetAnimation();
    }

    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    startTimeRef.current = undefined;
    animationRef.current = requestAnimationFrame(animate);
  }, [playbackState.isComplete, settings.loopMode, resetAnimation, animate]);

  // ===============================
  // Additional Playback Controls
  // ===============================

  const pause = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const stop = () => {
    pause();
    resetAnimation();
  };

  const nextStroke = () => {
    if (playbackState.currentStroke < strokes.length - 1) {
      setPlaybackState(prev => ({
        ...prev,
        currentStroke: prev.currentStroke + 1,
        currentProgress: 0
      }));
      startTimeRef.current = undefined;
    }
  };

  const previousStroke = () => {
    if (playbackState.currentStroke > 0) {
      setPlaybackState(prev => ({
        ...prev,
        currentStroke: prev.currentStroke - 1,
        currentProgress: 0
      }));
      startTimeRef.current = undefined;
    }
  };

  // ===============================
  // Effects
  // ===============================

  useEffect(() => {
    initializeAnimation();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeAnimation]);

  useEffect(() => {
    if (playbackState.isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playbackState.isPlaying, animate]);

  // ===============================
  // Render Functions
  // ===============================

  const renderPlaybackControls = () => (
    <div className="flex items-center justify-center gap-2 p-4 bg-silk-cream/50 rounded-lg">
      <Button
        size="sm"
        variant="outline"
        onClick={previousStroke}
        disabled={playbackState.currentStroke === 0}
        className="border-ink-black/20"
      >
        <SkipBack className="w-4 h-4" />
      </Button>

      {playbackState.isPlaying ? (
        <Button size="sm" onClick={pause} className="bg-celadon-green text-ink-black hover:bg-celadon-green/80">
          <Pause className="w-4 h-4" />
        </Button>
      ) : (
        <Button size="sm" onClick={play} className="bg-celadon-green text-ink-black hover:bg-celadon-green/80">
          <Play className="w-4 h-4" />
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={stop}
        className="border-ink-black/20"
      >
        <Square className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={nextStroke}
        disabled={playbackState.currentStroke === strokes.length - 1}
        className="border-ink-black/20"
      >
        <SkipForward className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-ink-black/70">Speed:</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSettings(prev => ({ 
              ...prev, 
              playbackSpeed: Math.max(0.25, prev.playbackSpeed - 0.25) 
            }))}
            className="h-8 w-8 p-0 border-ink-black/20"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {settings.playbackSpeed}x
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSettings(prev => ({ 
              ...prev, 
              playbackSpeed: Math.min(3, prev.playbackSpeed + 0.25) 
            }))}
            className="h-8 w-8 p-0 border-ink-black/20"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowSettings(!showSettings)}
        className="border-ink-black/20 ml-4"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderProgressBar = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-black/70">
          Stroke {playbackState.currentStroke + 1} of {strokes.length}
        </span>
        <span className="text-ink-black/70">
          {(playbackState.totalProgress * 100).toFixed(1)}%
        </span>
      </div>
      <Progress value={playbackState.totalProgress * 100} className="h-2" />
      
      {strokes[playbackState.currentStroke] && (
        <div className="text-xs text-ink-black/60">
          <Progress 
            value={playbackState.currentProgress * 100} 
            className="h-1 opacity-60" 
          />
        </div>
      )}
    </div>
  );

  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <Card className="mt-4 border-celadon-green/20">
        <CardHeader>
          <CardTitle className="text-base">Animation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showPressure}
                onChange={(e) => setSettings(prev => ({ ...prev, showPressure: e.target.checked }))}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm">Show Pressure</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showDirection}
                onChange={(e) => setSettings(prev => ({ ...prev, showDirection: e.target.checked }))}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm">Show Direction</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showTiming}
                onChange={(e) => setSettings(prev => ({ ...prev, showTiming: e.target.checked }))}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm">Show Grid</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm">Auto Advance</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-black mb-2">Loop Mode</label>
            <select
              value={settings.loopMode}
              onChange={(e) => setSettings(prev => ({ ...prev, loopMode: e.target.value as any }))}
              className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
            >
              <option value="none">No Loop</option>
              <option value="single">Loop Current Stroke</option>
              <option value="all">Loop All Strokes</option>
            </select>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStrokeInfo = () => {
    const currentStroke = strokes[playbackState.currentStroke];
    if (!currentStroke) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brush className="w-4 h-4 text-celadon-green" />
            Stroke {playbackState.currentStroke + 1} Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-ink-black/70">Duration:</span>
                <span className="ml-2 font-medium">{currentStroke.duration}s</span>
              </div>
              <div>
                <span className="text-ink-black/70">Points:</span>
                <span className="ml-2 font-medium">{currentStroke.points.length}</span>
              </div>
              <div>
                <span className="text-ink-black/70">Brush:</span>
                <span className="ml-2 font-medium">{currentStroke.brush_type}</span>
              </div>
              <div>
                <span className="text-ink-black/70">Position:</span>
                <span className="ml-2 font-medium">{currentStroke.character_position || 'N/A'}</span>
              </div>
            </div>

            {currentStroke.educational_notes.length > 0 && (
              <div>
                <h4 className="font-medium text-ink-black mb-2">Educational Notes:</h4>
                <ul className="space-y-1">
                  {currentStroke.educational_notes.map((note, index) => (
                    <li key={index} className="text-sm text-ink-black/80 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-celadon-green rounded-full mt-2 flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEducationalContent = () => {
    if (!showEducational || !educationalContent) return null;

    return (
      <Card className="mt-4 border-temple-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-temple-gold" />
              Educational Content
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEducational(false)}
              className="border-ink-black/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {educationalContent.stroke_analysis?.technique_breakdown && (
            <div>
              <h4 className="font-medium text-ink-black mb-3">Technique Breakdown</h4>
              <div className="space-y-3">
                {educationalContent.stroke_analysis.technique_breakdown.map((technique, index) => (
                  <div key={index} className="bg-temple-gold/10 rounded-lg p-3">
                    <h5 className="font-medium text-ink-black mb-2">{technique.technique_name}</h5>
                    <p className="text-sm text-ink-black/80 mb-2">{technique.description}</p>
                    {technique.key_points.length > 0 && (
                      <ul className="text-xs text-ink-black/70 space-y-1">
                        {technique.key_points.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-temple-gold rounded-full mt-1.5 flex-shrink-0" />
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
              <h4 className="font-medium text-ink-black mb-3">Practice Quiz</h4>
              <Button
                onClick={() => setCurrentQuizQuestion(0)}
                className="bg-temple-gold text-ink-black hover:bg-temple-gold/80"
              >
                Start Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCanvas = () => (
    <div className="relative bg-ink-black/5 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-auto border border-celadon-green/20 rounded-lg bg-rice-paper"
        style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
      />
      
      {/* Overlay controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEducational(!showEducational)}
          className="bg-silk-cream/90 backdrop-blur-sm border-ink-black/20"
        >
          <Info className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-silk-cream/90 backdrop-blur-sm border-ink-black/20"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      {/* Stroke counter overlay */}
      <div className="absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1">
        <span className="text-sm font-medium text-ink-black">
          Stroke {playbackState.currentStroke + 1} / {strokes.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-50 bg-rice-paper p-6 overflow-auto",
      className
    )}>
      {/* Header */}
      <div className="text-center">
        <h2 className="font-calligraphy text-xl font-bold text-ink-black mb-2">
          Stroke Animation Player
        </h2>
        <p className="text-ink-black/70">
          Learn traditional calligraphy through animated brush stroke demonstrations
        </p>
      </div>

      {/* Main Canvas */}
      {renderCanvas()}

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Playback Controls */}
      {renderPlaybackControls()}

      {/* Settings Panel */}
      {renderSettings()}

      {/* Stroke Information */}
      {renderStrokeInfo()}

      {/* Educational Content */}
      {renderEducationalContent()}
    </div>
  );
};

export default StrokeAnimationPlayer;
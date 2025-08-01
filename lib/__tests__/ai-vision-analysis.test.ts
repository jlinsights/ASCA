import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock AI Vision Analysis functions
const mockAnalyzeStrokePattern = jest.fn()
const mockAnalyzeBrushControl = jest.fn()
const mockAnalyzeInkFlow = jest.fn()
const mockAnalyzeComposition = jest.fn()
const mockAnalyzeStyleClassification = jest.fn()
const mockGenerateFeedback = jest.fn()

// Mock the AI vision module
jest.mock('@/lib/ai-vision/stroke-detection', () => ({
  analyzeStrokePattern: mockAnalyzeStrokePattern,
  analyzeBrushControl: mockAnalyzeBrushControl,
  analyzeInkFlow: mockAnalyzeInkFlow
}))

jest.mock('@/lib/ai-vision/composition-analysis', () => ({
  analyzeComposition: mockAnalyzeComposition
}))

jest.mock('@/lib/ai-vision/style-classification', () => ({
  analyzeStyleClassification: mockAnalyzeStyleClassification
}))

jest.mock('@/lib/ai-vision/feedback-generator', () => ({
  generateFeedback: mockGenerateFeedback
}))

// Import the functions after mocking
import {
  analyzeCalligraphyImage,
  processAnalysisResults,
  validateAnalysisInput,
  calculateOverallScore,
  generateImprovementSuggestions
} from '@/lib/ai-vision/analysis-engine'

import type {
  CalligraphyAnalysis,
  StrokeAnalysis,
  BrushControlAnalysis,
  InkFlowAnalysis,
  CompositionAnalysis,
  StyleClassification
} from '@/lib/types/ai-vision'

describe('AI Vision Analysis Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateAnalysisInput', () => {
    it('should validate valid image data', () => {
      const validInput = {
        imageUrl: 'https://example.com/image.jpg',
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        userId: 'user-123',
        analysisType: 'comprehensive' as const
      }

      expect(() => validateAnalysisInput(validInput)).not.toThrow()
    })

    it('should reject invalid image URL', () => {
      const invalidInput = {
        imageUrl: 'not-a-url',
        userId: 'user-123',
        analysisType: 'comprehensive' as const
      }

      expect(() => validateAnalysisInput(invalidInput))
        .toThrow('Invalid image URL format')
    })

    it('should reject missing required fields', () => {
      const invalidInput = {
        imageUrl: 'https://example.com/image.jpg'
        // Missing userId and analysisType
      } as any

      expect(() => validateAnalysisInput(invalidInput))
        .toThrow('Missing required fields')
    })

    it('should validate image data format', () => {
      const invalidInput = {
        imageUrl: 'https://example.com/image.jpg',
        imageData: 'invalid-base64-data',
        userId: 'user-123',
        analysisType: 'comprehensive' as const
      }

      expect(() => validateAnalysisInput(invalidInput))
        .toThrow('Invalid image data format')
    })

    it('should validate analysis type', () => {
      const invalidInput = {
        imageUrl: 'https://example.com/image.jpg',
        userId: 'user-123',
        analysisType: 'invalid-type' as any
      }

      expect(() => validateAnalysisInput(invalidInput))
        .toThrow('Invalid analysis type')
    })
  })

  describe('analyzeCalligraphyImage', () => {
    const mockStrokeAnalysis: StrokeAnalysis = {
      strokes: [
        {
          id: 'stroke-1',
          points: [[10, 20], [15, 25], [20, 30]],
          pressure: [0.5, 0.7, 0.6],
          velocity: [1.2, 1.5, 1.1],
          direction: [45, 50, 48],
          quality: {
            smoothness: 0.8,
            consistency: 0.7,
            confidence: 0.9
          }
        }
      ],
      strokeCount: 1,
      averageStrokeLength: 15.2,
      strokeVariation: 0.3,
      overallQuality: 0.75
    }

    const mockBrushControl: BrushControlAnalysis = {
      pressureControl: {
        average: 0.6,
        variation: 0.2,
        consistency: 0.8,
        transitions: 0.7
      },
      speedControl: {
        average: 1.3,
        variation: 0.3,
        consistency: 0.75,
        rhythm: 0.8
      },
      directionControl: {
        precision: 0.85,
        stability: 0.8,
        fluidity: 0.9
      },
      overallControl: 0.78
    }

    const mockInkFlow: InkFlowAnalysis = {
      distribution: {
        uniformity: 0.7,
        coverage: 0.85,
        density: 0.8
      },
      inkUsage: {
        efficiency: 0.75,
        waste: 0.1,
        consistency: 0.8
      },
      wetness: {
        level: 0.6,
        variation: 0.2,
        appropriateness: 0.8
      },
      overallFlow: 0.76
    }

    const mockComposition: CompositionAnalysis = {
      layout: {
        balance: 0.8,
        symmetry: 0.7,
        spacing: 0.85,
        alignment: 0.9
      },
      proportions: {
        characterSize: 0.8,
        lineSpacing: 0.75,
        margins: 0.85,
        harmony: 0.8
      },
      aesthetics: {
        visualFlow: 0.85,
        elegance: 0.7,
        impact: 0.8
      },
      overallComposition: 0.79
    }

    const mockStyleClassification: StyleClassification = {
      detectedStyle: 'kaishu',
      confidence: 0.85,
      styleFeatures: {
        brushwork: 0.8,
        structure: 0.85,
        rhythm: 0.7,
        expression: 0.75
      },
      historicalAccuracy: 0.8,
      modernInterpretation: 0.7,
      alternativeStyles: [
        { style: 'xingshu', probability: 0.15 },
        { style: 'lishu', probability: 0.05 }
      ]
    }

    beforeEach(() => {
      mockAnalyzeStrokePattern.mockResolvedValue(mockStrokeAnalysis)
      mockAnalyzeBrushControl.mockResolvedValue(mockBrushControl)
      mockAnalyzeInkFlow.mockResolvedValue(mockInkFlow)
      mockAnalyzeComposition.mockResolvedValue(mockComposition)
      mockAnalyzeStyleClassification.mockResolvedValue(mockStyleClassification)
    })

    it('should perform comprehensive analysis', async () => {
      const input = {
        imageUrl: 'https://example.com/calligraphy.jpg',
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        userId: 'user-123',
        analysisType: 'comprehensive' as const
      }

      const result = await analyzeCalligraphyImage(input)

      expect(mockAnalyzeStrokePattern).toHaveBeenCalledWith(input.imageData)
      expect(mockAnalyzeBrushControl).toHaveBeenCalledWith(input.imageData)
      expect(mockAnalyzeInkFlow).toHaveBeenCalledWith(input.imageData)
      expect(mockAnalyzeComposition).toHaveBeenCalledWith(input.imageData)
      expect(mockAnalyzeStyleClassification).toHaveBeenCalledWith(input.imageData)

      expect(result).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        imageUrl: input.imageUrl,
        analysisType: 'comprehensive',
        strokeAnalysis: mockStrokeAnalysis,
        brushControl: mockBrushControl,
        inkFlow: mockInkFlow,
        composition: mockComposition,
        styleClassification: mockStyleClassification,
        overallScore: expect.any(Number),
        feedback: expect.any(Object),
        createdAt: expect.any(Date)
      })
    })

    it('should perform quick analysis with limited components', async () => {
      const input = {
        imageUrl: 'https://example.com/calligraphy.jpg',
        userId: 'user-123',
        analysisType: 'quick' as const
      }

      await analyzeCalligraphyImage(input)

      expect(mockAnalyzeStrokePattern).toHaveBeenCalled()
      expect(mockAnalyzeBrushControl).toHaveBeenCalled()
      expect(mockAnalyzeInkFlow).not.toHaveBeenCalled()
      expect(mockAnalyzeComposition).not.toHaveBeenCalled()
      expect(mockAnalyzeStyleClassification).toHaveBeenCalled()
    })

    it('should perform style-focused analysis', async () => {
      const input = {
        imageUrl: 'https://example.com/calligraphy.jpg',
        userId: 'user-123',
        analysisType: 'style_focus' as const
      }

      await analyzeCalligraphyImage(input)

      expect(mockAnalyzeStyleClassification).toHaveBeenCalled()
      expect(mockAnalyzeComposition).toHaveBeenCalled()
      expect(mockAnalyzeStrokePattern).toHaveBeenCalled()
      expect(mockAnalyzeBrushControl).not.toHaveBeenCalled()
      expect(mockAnalyzeInkFlow).not.toHaveBeenCalled()
    })

    it('should handle analysis errors gracefully', async () => {
      mockAnalyzeStrokePattern.mockRejectedValue(new Error('Analysis failed'))

      const input = {
        imageUrl: 'https://example.com/calligraphy.jpg',
        userId: 'user-123',
        analysisType: 'comprehensive' as const
      }

      await expect(analyzeCalligraphyImage(input)).rejects.toThrow('Analysis failed')
    })
  })

  describe('calculateOverallScore', () => {
    it('should calculate overall score from analysis components', () => {
      const analysisResults = {
        strokeAnalysis: { overallQuality: 0.8 },
        brushControl: { overallControl: 0.75 },
        inkFlow: { overallFlow: 0.7 },
        composition: { overallComposition: 0.85 },
        styleClassification: { confidence: 0.9 }
      } as any

      const score = calculateOverallScore(analysisResults, 'comprehensive')

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
      expect(typeof score).toBe('number')
    })

    it('should weight components differently for different analysis types', () => {
      const analysisResults = {
        strokeAnalysis: { overallQuality: 0.8 },
        brushControl: { overallControl: 0.75 },
        styleClassification: { confidence: 0.9 }
      } as any

      const quickScore = calculateOverallScore(analysisResults, 'quick')
      const styleScore = calculateOverallScore(analysisResults, 'style_focus')

      expect(quickScore).not.toEqual(styleScore)
    })

    it('should handle missing analysis components', () => {
      const partialResults = {
        strokeAnalysis: { overallQuality: 0.8 }
      } as any

      const score = calculateOverallScore(partialResults, 'quick')

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })

  describe('generateImprovementSuggestions', () => {
    it('should generate targeted suggestions based on weak areas', () => {
      const analysisResults = {
        strokeAnalysis: { overallQuality: 0.6 }, // Weak
        brushControl: { overallControl: 0.9 }, // Strong
        inkFlow: { overallFlow: 0.5 }, // Weak
        composition: { overallComposition: 0.8 }, // Good
        styleClassification: { confidence: 0.7 }
      } as any

      const suggestions = generateImprovementSuggestions(analysisResults)

      expect(suggestions).toHaveLength(3) // Should focus on 3 main areas
      expect(suggestions[0].priority).toBe('high') // Weakest area first
      expect(suggestions[0].category).toContain('ink_flow') // Should identify ink flow as major weakness
    })

    it('should provide balanced suggestions for overall good performance', () => {
      const analysisResults = {
        strokeAnalysis: { overallQuality: 0.85 },
        brushControl: { overallControl: 0.8 },
        inkFlow: { overallFlow: 0.82 },
        composition: { overallComposition: 0.88 },
        styleClassification: { confidence: 0.85 }
      } as any

      const suggestions = generateImprovementSuggestions(analysisResults)

      expect(suggestions).toHaveLength(2) // Fewer suggestions for good performance
      expect(suggestions.every(s => s.priority === 'medium' || s.priority === 'low')).toBe(true)
    })

    it('should include specific practice exercises', () => {
      const analysisResults = {
        brushControl: { 
          overallControl: 0.5,
          pressureControl: { consistency: 0.3 }
        }
      } as any

      const suggestions = generateImprovementSuggestions(analysisResults)
      
      const brushControlSuggestion = suggestions.find(s => s.category.includes('brush_control'))
      expect(brushControlSuggestion?.exercises).toBeDefined()
      expect(brushControlSuggestion?.exercises.length).toBeGreaterThan(0)
    })
  })

  describe('processAnalysisResults', () => {
    it('should format analysis results for storage', () => {
      const rawResults = {
        strokeAnalysis: { overallQuality: 0.8 },
        brushControl: { overallControl: 0.75 },
        inkFlow: { overallFlow: 0.7 },
        composition: { overallComposition: 0.85 },
        styleClassification: { confidence: 0.9, detectedStyle: 'kaishu' }
      } as any

      const processed = processAnalysisResults(rawResults, 'comprehensive')

      expect(processed).toMatchObject({
        overallScore: expect.any(Number),
        feedback: expect.any(Object),
        improvementSuggestions: expect.any(Array),
        analysisMetadata: expect.objectContaining({
          processingTime: expect.any(Number),
          algorithmVersion: expect.any(String),
          confidenceLevel: expect.any(Number)
        })
      })
    })

    it('should include performance metrics', () => {
      const rawResults = {
        strokeAnalysis: { overallQuality: 0.8 }
      } as any

      const startTime = Date.now()
      const processed = processAnalysisResults(rawResults, 'quick')

      expect(processed.analysisMetadata.processingTime).toBeGreaterThanOrEqual(0)
      expect(processed.analysisMetadata.processingTime).toBeLessThan(Date.now() - startTime + 100)
    })
  })
})
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Download, Maximize2, Minimize2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

// Color palettes for different themes
const colorPalettes = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'],
  calligraphy: ['#2D4A5A', '#8B4513', '#DAA520', '#8FBC8F', '#CD853F', '#B22222'],
  performance: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'],
  accessibility: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'],
}

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
}

function CustomTooltip({ active, payload, label, formatter, labelFormatter }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
        {label && (
          <p className="font-medium text-foreground mb-2">
            {labelFormatter ? labelFormatter(label) : label}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Enhanced Area Chart
interface EnhancedAreaChartProps {
  data: any[]
  xDataKey: string
  yDataKeys: string[]
  title?: string
  description?: string
  className?: string
  height?: number
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  fillOpacity?: number
  strokeWidth?: number
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
}

export function EnhancedAreaChart({
  data,
  xDataKey,
  yDataKeys,
  title,
  description,
  className,
  height = 300,
  colors = colorPalettes.default,
  showLegend = true,
  showGrid = true,
  fillOpacity = 0.3,
  strokeWidth = 2,
  formatter,
  labelFormatter,
}: EnhancedAreaChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey={xDataKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip formatter={formatter} labelFormatter={labelFormatter} />}
            />
            {showLegend && <Legend />}
            {yDataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={fillOpacity}
                strokeWidth={strokeWidth}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Enhanced Bar Chart with comparisons
interface EnhancedBarChartProps {
  data: any[]
  xDataKey: string
  yDataKeys: string[]
  title?: string
  description?: string
  className?: string
  height?: number
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  barSize?: number
  layout?: 'horizontal' | 'vertical'
  formatter?: (value: any, name: string) => [string, string]
  labelFormatter?: (label: string) => string
}

export function EnhancedBarChart({
  data,
  xDataKey,
  yDataKeys,
  title,
  description,
  className,
  height = 300,
  colors = colorPalettes.default,
  showLegend = true,
  showGrid = true,
  barSize,
  layout = 'vertical',
  formatter,
  labelFormatter,
}: EnhancedBarChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout={layout}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey={xDataKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip formatter={formatter} labelFormatter={labelFormatter} />}
            />
            {showLegend && <Legend />}
            {yDataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={barSize}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Performance Metrics Dashboard
interface PerformanceMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  target?: number
  unit?: string
}

interface PerformanceMetricCardProps {
  metric: PerformanceMetric
  className?: string
}

export function PerformanceMetricCard({ metric, className }: PerformanceMetricCardProps) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatValue = (value: number) => {
    if (metric.unit === '%') {
      return `${value.toFixed(1)}%`
    }
    if (metric.unit === 'ms') {
      return `${value.toFixed(0)}ms`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{formatValue(metric.value)}</span>
              {metric.unit && !formatValue(metric.value).includes(metric.unit) && (
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn('text-xs font-medium', getTrendColor())}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </div>
          
          {metric.target && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-sm font-medium">{formatValue(metric.target)}</p>
              <div className="mt-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Multi-Chart Dashboard
interface ChartConfig {
  type: 'area' | 'bar' | 'line' | 'pie'
  data: any[]
  title: string
  description?: string
  config: any
}

interface MultiChartDashboardProps {
  charts: ChartConfig[]
  className?: string
  columns?: number
}

export function MultiChartDashboard({ 
  charts, 
  className, 
  columns = 2 
}: MultiChartDashboardProps) {
  const [selectedChart, setSelectedChart] = React.useState<number | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const renderChart = (chart: ChartConfig, index: number) => {
    const isFullscreen = selectedChart === index
    
    const chartProps = {
      ...chart.config,
      title: chart.title,
      description: chart.description,
      height: isFullscreen ? 500 : 300,
      className: isFullscreen ? 'col-span-full' : '',
      key: `${index}-${refreshKey}`,
    }

    const actions = (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedChart(isFullscreen ? null : index)}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )

    switch (chart.type) {
      case 'area':
        return (
          <div key={index} className={isFullscreen ? 'col-span-full' : ''}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{chart.title}</h3>
                {chart.description && (
                  <p className="text-sm text-muted-foreground">{chart.description}</p>
                )}
              </div>
              {actions}
            </div>
            <EnhancedAreaChart {...chartProps} />
          </div>
        )
      case 'bar':
        return (
          <div key={index} className={isFullscreen ? 'col-span-full' : ''}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{chart.title}</h3>
                {chart.description && (
                  <p className="text-sm text-muted-foreground">{chart.description}</p>
                )}
              </div>
              {actions}
            </div>
            <EnhancedBarChart {...chartProps} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div 
        className={cn(
          'grid gap-6',
          selectedChart !== null ? 'grid-cols-1' : 
          columns === 1 ? 'grid-cols-1' :
          columns === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {selectedChart !== null 
          ? renderChart(charts[selectedChart], selectedChart)
          : charts.map((chart, index) => renderChart(chart, index))
        }
      </div>
    </div>
  )
}

// Analytics Summary Component
interface AnalyticsSummaryProps {
  metrics: PerformanceMetric[]
  timeRange: string
  onTimeRangeChange: (range: string) => void
  className?: string
}

export function AnalyticsSummary({
  metrics,
  timeRange,
  onTimeRangeChange,
  className,
}: AnalyticsSummaryProps) {
  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Summary</h2>
          <p className="text-muted-foreground">
            Performance metrics and insights for your calligraphy platform
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <PerformanceMetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  )
}

// Export utilities
export const chartUtils = {
  formatters: {
    percentage: (value: number) => `${value.toFixed(1)}%`,
    currency: (value: number) => `$${value.toLocaleString()}`,
    number: (value: number) => value.toLocaleString(),
    time: (value: number) => `${value}ms`,
    bytes: (value: number) => {
      if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`
      if (value >= 1024) return `${(value / 1024).toFixed(1)}KB`
      return `${value}B`
    },
  },
  colors: colorPalettes,
  generateColorPalette: (count: number, palette = 'default') => {
    const colors = colorPalettes[palette as keyof typeof colorPalettes]
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  },
}
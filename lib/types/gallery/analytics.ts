// User Interaction and Analytics

export interface UserInteraction {
  user_id: string
  artwork_id: string
  interaction_type: 'view' | 'zoom' | 'compare' | 'save' | 'share' | 'annotate' | 'quiz'
  timestamp: Date
  duration?: number
  metadata?: {
    zoom_level?: number
    region_viewed?: string
    comparison_artworks?: string[]
    quiz_score?: number
    device_type?: string
    referrer?: string
  }
}

export interface ArtworkAnalytics {
  artwork_id: string
  metrics: {
    total_views: number
    unique_viewers: number
    average_view_duration: number
    zoom_interactions: number
    detail_region_views: { [region: string]: number }
    educational_engagement: number
    share_count: number
    save_count: number
  }
  demographics: {
    viewer_types: { [type: string]: number }
    geographic_distribution: { [country: string]: number }
    device_breakdown: { [device: string]: number }
  }
  temporal_data: {
    daily_views: { [date: string]: number }
    peak_hours: number[]
    seasonal_trends: { [season: string]: number }
  }
}

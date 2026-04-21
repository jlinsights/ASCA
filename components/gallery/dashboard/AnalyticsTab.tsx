
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsTab = ({ analytics, artworks }: any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Artworks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Artworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.slice(0, 5).map((item: any, index: number) => {
                const artwork = artworks.find((a: any) => a.id === item.artwork_id);
                if (!artwork) return null;

                return (
                  <div key={item.artwork_id} className="flex items-center gap-4 p-3 bg-silk-cream/30 rounded-lg">
                    <div className="w-8 h-8 bg-temple-gold text-ink-black rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-ink-black">{artwork.title.original}</h4>
                      <p className="text-sm text-ink-black/70">{artwork.artist.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink-black">{item.metrics.total_views.toLocaleString()}</p>
                      <p className="text-xs text-ink-black/60">views</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-summer-jade/10 rounded-lg">
              <p className="text-2xl font-bold text-summer-jade">
                {analytics.reduce((sum: number, a: any) => sum + a.metrics.unique_viewers, 0).toLocaleString()}
              </p>
              <p className="text-sm text-ink-black/70">Unique Viewers</p>
            </div>
            
            <div className="text-center p-4 bg-temple-gold/10 rounded-lg">
              <p className="text-2xl font-bold text-temple-gold">
                {(analytics.reduce((sum: number, a: any) => sum + a.metrics.average_view_duration, 0) / analytics.length / 60).toFixed(1)}m
              </p>
              <p className="text-sm text-ink-black/70">Avg. View Time</p>
            </div>
            
            <div className="text-center p-4 bg-celadon-green/10 rounded-lg">
              <p className="text-2xl font-bold text-celadon-green">
                {analytics.reduce((sum: number, a: any) => sum + a.metrics.educational_engagement, 0)}
              </p>
              <p className="text-sm text-ink-black/70">Educational Interactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

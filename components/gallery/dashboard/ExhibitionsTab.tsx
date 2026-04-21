
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ExhibitionsTab = ({ exhibitions }: any) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Virtual Exhibitions ({exhibitions.length})</CardTitle>
            <Button size="sm" className="bg-autumn-gold text-ink-black hover:bg-autumn-gold/80">
              <Plus className="w-4 h-4 mr-1" />
              Create Exhibition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exhibitions.map((exhibition: any) => {
              const isActive = new Date(exhibition.schedule.opening_date) <= new Date() && 
                             (!exhibition.schedule.closing_date || new Date(exhibition.schedule.closing_date) >= new Date());
              const isUpcoming = new Date(exhibition.schedule.opening_date) > new Date();

              return (
                <Card key={exhibition.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-calligraphy font-semibold text-ink-black">
                            {exhibition.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              isActive && "bg-summer-jade/20 text-summer-jade border-summer-jade",
                              isUpcoming && "bg-temple-gold/20 text-temple-gold border-temple-gold"
                            )}
                          >
                            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended'}
                          </Badge>
                        </div>
                        {exhibition.subtitle && (
                          <p className="text-sm text-ink-black/70 mb-2">{exhibition.subtitle}</p>
                        )}
                        <p className="text-sm text-ink-black/80 line-clamp-2 mb-4">
                          {exhibition.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-ink-black/70">Curator:</span>
                            <span className="ml-2 font-medium">{exhibition.curation.chief_curator}</span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Sections:</span>
                            <span className="ml-2 font-medium">{exhibition.layout.sections.length}</span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Opening:</span>
                            <span className="ml-2 font-medium">
                              {new Date(exhibition.schedule.opening_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Layout:</span>
                            <span className="ml-2 font-medium capitalize">{exhibition.layout.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

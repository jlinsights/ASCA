'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  Star,
  Bookmark,
  Share2,
  Filter,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for cultural events
interface CulturalEvent {
  id: string;
  title: {
    original: string;
    romanized: string;
    english: string;
  };
  description: string;
  type: 'exhibition' | 'workshop' | 'ceremony' | 'festival' | 'lecture' | 'performance';
  date: {
    start: Date;
    end?: Date;
    lunar?: {
      month: number;
      day: number;
      year: number;
    };
  };
  location: {
    venue: string;
    address: string;
    online?: boolean;
  };
  organizer: string;
  instructor?: string;
  capacity?: number;
  registered?: number;
  price?: {
    amount: number;
    currency: string;
    free?: boolean;
  };
  tags: string[];
  culturalSignificance: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  featured?: boolean;
  registrationRequired?: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface TraditionalDate {
  year: number;
  month: number;
  day: number;
  lunarMonth: number;
  lunarDay: number;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  animal: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  festivals?: string[];
}

interface CulturalCalendarProps {
  events: CulturalEvent[];
  showLunarCalendar?: boolean;
  showTraditionalFestivals?: boolean;
  showSeasonalThemes?: boolean;
  className?: string;
}

const CulturalCalendar: React.FC<CulturalCalendarProps> = ({
  events,
  showLunarCalendar = true,
  showTraditionalFestivals = true,
  showSeasonalThemes = true,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Traditional calendar data (simplified)
  const getTraditionalDate = (date: Date): TraditionalDate => {
    // This is a simplified implementation - in a real app, you'd use a proper lunar calendar library
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified lunar date calculation (approximation)
    const lunarMonth = ((month + 10) % 12) + 1;
    const lunarDay = Math.floor(day * 0.95) + 1;
    
    // Five elements cycle
    const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
    const element = elements[year % 5];
    
    // Chinese zodiac animals
    const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    const animal = animals[year % 12];
    
    // Season determination
    const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'] as const;
    const season = seasons[month - 1];
    
    return {
      year,
      month,
      day,
      lunarMonth,
      lunarDay,
      element: element || 'wood', // Provide fallback for TypeScript
      animal: animal || 'Rat', // Provide fallback for TypeScript
      season: season || 'spring', // Provide fallback for TypeScript
      festivals: getTraditionalFestivals(month, day)
    };
  };

  // Get traditional festivals for a given date
  const getTraditionalFestivals = (month: number, day: number): string[] => {
    const festivals: Record<string, string[]> = {
      '1-1': ['New Year\'s Day'],
      '2-14': ['Lantern Festival'],
      '3-3': ['Double Third Festival'],
      '5-5': ['Dragon Boat Festival'],
      '7-7': ['Qixi Festival'],
      '8-15': ['Mid-Autumn Festival'],
      '9-9': ['Double Ninth Festival'],
      '12-22': ['Winter Solstice']
    };
    
    return festivals[`${month}-${day}`] || [];
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CulturalEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    if (selectedFilters.length === 0) return events;
    
    return events.filter(event => 
      selectedFilters.some(filter => 
        event.type === filter || 
        event.tags.includes(filter) ||
        event.season === filter
      )
    );
  }, [events, selectedFilters]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const types = [...new Set(events.map(e => e.type))];
    const tags = [...new Set(events.flatMap(e => e.tags))];
    const seasons = [...new Set(events.map(e => e.season))];
    
    return { types, tags, seasons };
  }, [events]);

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const nextMonthDate: Date = new Date(year, month + 1, i - days.length + 1);
      days.push({ date: nextMonthDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getSeasonalColor = (season: string) => {
    switch (season) {
      case 'spring': return 'spring-blossom';
      case 'summer': return 'summer-jade';
      case 'autumn': return 'autumn-gold';
      case 'winter': return 'winter-snow';
      default: return 'celadon-green';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition': return 'temple-gold';
      case 'workshop': return 'summer-jade';
      case 'ceremony': return 'vermillion';
      case 'festival': return 'spring-blossom';
      case 'lecture': return 'celadon-green';
      case 'performance': return 'plum-purple';
      default: return 'ink-black';
    }
  };

  const formatEventTime = (date: Date, endDate?: Date) => {
    const timeFormat = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (endDate) {
      return `${timeFormat.format(date)} - ${timeFormat.format(endDate)}`;
    }
    return timeFormat.format(date);
  };

  const EventCard: React.FC<{ event: CulturalEvent; compact?: boolean }> = ({ event, compact = false }) => (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-celadon-green/20",
      compact ? "p-2" : "p-4",
      `hover:border-${getEventTypeColor(event.type)}/40`
    )}>
      <CardContent className={cn("p-0", !compact && "space-y-3")}>
        {/* Event Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn(
              "font-calligraphy font-semibold text-ink-black group-hover:text-celadon-green transition-colors",
              compact ? "text-sm line-clamp-1" : "text-base mb-1"
            )}>
              {event.title.original}
            </h4>
            {!compact && (
              <p className="font-english text-sm text-ink-black/70 mb-1">
                {event.title.english}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                `border-${getEventTypeColor(event.type)} text-${getEventTypeColor(event.type)}`
              )}
            >
              {event.type}
            </Badge>
            {event.featured && (
              <Star className="w-3 h-3 text-temple-gold" />
            )}
          </div>
        </div>

        {/* Event Details */}
        {!compact && (
          <>
            <div className="space-y-2 text-sm text-ink-black/70">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{formatEventTime(event.date.start, event.date.end)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{event.location.venue}</span>
                {event.location.online && (
                  <Badge variant="secondary" className="text-xs">Online</Badge>
                )}
              </div>

              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>{event.registered || 0} / {event.capacity} registered</span>
                </div>
              )}
            </div>

            <p className="text-sm text-ink-black/80 line-clamp-2">
              {event.description}
            </p>

            {/* Cultural Significance */}
            {event.culturalSignificance && (
              <div className="bg-temple-gold/10 rounded-md p-2 border border-temple-gold/20">
                <p className="text-xs text-ink-black/70 font-serif italic">
                  {event.culturalSignificance}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="text-xs bg-celadon-green/10 text-celadon-green border-celadon-green/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className={cn(
                  "flex-1 font-english",
                  `bg-${getEventTypeColor(event.type)} text-ink-black hover:bg-${getEventTypeColor(event.type)}/80`
                )}
              >
                {event.registrationRequired ? 'Register' : 'Learn More'}
              </Button>
              <Button size="sm" variant="outline" className="border-ink-black/20">
                <Bookmark className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" className="border-ink-black/20">
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const MonthView = () => {
    const days = getDaysInMonth();
    const traditionalDate = getTraditionalDate(currentDate);

    return (
      <div className="space-y-6">
        {/* Traditional Calendar Info */}
        {showLunarCalendar && (
          <Card className="bg-gradient-to-r from-temple-gold/10 to-autumn-gold/10 border-temple-gold/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-calligraphy text-lg font-semibold text-ink-black mb-1">
                    农历 {traditionalDate.lunarMonth}月
                  </h4>
                  <p className="font-english text-sm text-ink-black/70">
                    Lunar Month {traditionalDate.lunarMonth}
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-ink-black mb-1">
                    {traditionalDate.animal} Year
                  </h4>
                  <p className="font-english text-sm text-ink-black/70">
                    Element: {traditionalDate.element}
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-semibold text-ink-black mb-1 capitalize">
                    {traditionalDate.season} Season
                  </h4>
                  {showSeasonalThemes && (
                    <div className={cn(
                      "w-4 h-4 rounded-full mx-auto",
                      `bg-${getSeasonalColor(traditionalDate.season)}`
                    )} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-ink-black/70 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map(({ date, isCurrentMonth }, index) => {
                const dayEvents = getEventsForDate(date);
                const traditionalDayData = getTraditionalDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-24 p-2 rounded-lg border transition-colors cursor-pointer",
                      isCurrentMonth 
                        ? "bg-rice-paper border-celadon-green/20 hover:bg-silk-cream" 
                        : "bg-ink-black/5 border-ink-black/10 text-ink-black/40",
                      isToday && "ring-2 ring-temple-gold ring-opacity-50 bg-temple-gold/10"
                    )}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isToday && "text-temple-gold font-bold"
                      )}>
                        {date.getDate()}
                      </span>
                      
                      {/* Lunar Date */}
                      {showLunarCalendar && isCurrentMonth && (
                        <span className="text-xs text-ink-black/50">
                          {traditionalDayData.lunarDay}
                        </span>
                      )}
                    </div>

                    {/* Traditional Festivals */}
                    {showTraditionalFestivals && traditionalDayData.festivals?.map((festival, i) => (
                      <div key={i} className="text-xs text-vermillion font-medium mb-1 line-clamp-1">
                        {festival}
                      </div>
                    ))}

                    {/* Events */}
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded mb-1 line-clamp-1 cursor-pointer hover:opacity-80",
                          `bg-${getEventTypeColor(event.type)}/20 text-${getEventTypeColor(event.type)}`
                        )}
                      >
                        {event.title.original}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-ink-black/50">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-4">
      {filteredEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      
      {filteredEvents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarIcon className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              No events found
            </h3>
            <p className="text-ink-black/60">
              Try adjusting your filters or check back later for new events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Date Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="border-celadon-green/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="font-calligraphy text-2xl font-bold text-ink-black min-w-48 text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="border-celadon-green/30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* View Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-celadon-green/30"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex gap-1 bg-silk-cream/50 rounded-lg p-1">
            {(['month', 'list'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "capitalize",
                  viewMode === mode && "bg-celadon-green text-ink-black"
                )}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-silk-cream/30 border-celadon-green/20">
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-serif font-semibold text-ink-black">Filter Events</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-ink-black mb-2">Event Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.types.map(type => (
                      <Badge
                        key={type}
                        variant={selectedFilters.includes(type) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors capitalize",
                          selectedFilters.includes(type) 
                            ? `bg-${getEventTypeColor(type)} text-ink-black` 
                            : "border-ink-black/20 hover:bg-ink-black/5"
                        )}
                        onClick={() => {
                          setSelectedFilters(prev => 
                            prev.includes(type) 
                              ? prev.filter(f => f !== type)
                              : [...prev, type]
                          );
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-ink-black mb-2">Season</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.seasons.map(season => (
                      <Badge
                        key={season}
                        variant={selectedFilters.includes(season) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors capitalize",
                          selectedFilters.includes(season) 
                            ? `bg-${getSeasonalColor(season)} text-ink-black` 
                            : "border-ink-black/20 hover:bg-ink-black/5"
                        )}
                        onClick={() => {
                          setSelectedFilters(prev => 
                            prev.includes(season) 
                              ? prev.filter(f => f !== season)
                              : [...prev, season]
                          );
                        }}
                      >
                        {season}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-ink-black mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.tags.slice(0, 6).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedFilters.includes(tag) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors text-xs",
                          selectedFilters.includes(tag) 
                            ? "bg-celadon-green text-ink-black" 
                            : "border-ink-black/20 hover:bg-ink-black/5"
                        )}
                        onClick={() => {
                          setSelectedFilters(prev => 
                            prev.includes(tag) 
                              ? prev.filter(f => f !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFilters([])}
                  className="border-ink-black/20"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Content */}
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'list' && <ListView />}
    </div>
  );
};

export default CulturalCalendar;
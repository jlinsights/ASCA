'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  PlayCircle, 
  Download, 
  Star, 
  Clock, 
  Users, 
  Trophy,
  CheckCircle,
  Lock,
  ChevronRight,
  Volume2,
  FileText,
  Video,
  Headphones,
  Brush,
  Eye,
  Heart,
  Share2,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for learning content
interface LearningResource {
  id: string;
  title: {
    original: string;
    romanized: string;
    english: string;
  };
  description: string;
  type: 'video' | 'audio' | 'document' | 'interactive' | 'practice';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  duration: number; // in minutes
  instructor: {
    name: string;
    credentials: string;
    avatar: string;
  };
  content: {
    url: string;
    transcript?: string;
    materials?: string[];
  };
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  cultural_context: string;
  practice_exercises?: {
    id: string;
    title: string;
    type: 'stroke_practice' | 'character_writing' | 'composition' | 'critique';
    description: string;
  }[];
  rating: number;
  enrolled: number;
  completed: number;
  featured?: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  estimated_duration: number; // in hours
  modules: {
    id: string;
    title: string;
    description: string;
    resources: string[]; // resource IDs
    required: boolean;
    unlocked: boolean;
    completed: boolean;
  }[];
  certificate?: {
    available: boolean;
    requirements: string[];
  };
  cultural_significance: string;
  traditional_lineage?: string;
}

interface UserProgress {
  resourcesCompleted: string[];
  pathsEnrolled: string[];
  pathsCompleted: string[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned_date: Date;
  }[];
  streakDays: number;
  totalHours: number;
  level: number;
  experience: number;
}

interface LearningHubProps {
  resources: LearningResource[];
  learningPaths: LearningPath[];
  userProgress: UserProgress;
  showProgressiveDisclosure?: boolean;
  className?: string;
}

const LearningHub: React.FC<LearningHubProps> = ({
  resources,
  learningPaths,
  userProgress,
  showProgressiveDisclosure = true,
  className
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'paths' | 'resources' | 'practice'>('overview');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    difficulty?: string;
    type?: string;
    duration?: string;
  }>({});

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.title.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      switch (key) {
        case 'difficulty': return resource.difficulty === value;
        case 'type': return resource.type === value;
        case 'duration': 
          const duration = resource.duration;
          switch (value) {
            case 'short': return duration <= 15;
            case 'medium': return duration > 15 && duration <= 60;
            case 'long': return duration > 60;
            default: return true;
          }
        default: return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'summer-jade';
      case 'intermediate': return 'autumn-gold';
      case 'advanced': return 'vermillion';
      case 'master': return 'temple-gold';
      default: return 'celadon-green';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'document': return FileText;
      case 'interactive': return PlayCircle;
      case 'practice': return Brush;
      default: return BookOpen;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isResourceUnlocked = (resource: LearningResource) => {
    if (!showProgressiveDisclosure) return true;
    return resource.prerequisites.every(prereq => 
      userProgress.resourcesCompleted.includes(prereq)
    );
  };

  const isResourceCompleted = (resourceId: string) => {
    return userProgress.resourcesCompleted.includes(resourceId);
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-temple-gold/10 to-autumn-gold/10 border-temple-gold/20">
        <CardHeader>
          <CardTitle className="font-calligraphy text-xl text-ink-black">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-temple-gold mb-2">
                {userProgress.level}
              </div>
              <div className="text-sm text-ink-black/70">Current Level</div>
              <Progress value={(userProgress.experience % 1000) / 10} className="mt-2 h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-summer-jade mb-2">
                {userProgress.streakDays}
              </div>
              <div className="text-sm text-ink-black/70">Day Streak</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-vermillion mb-2">
                {userProgress.totalHours}
              </div>
              <div className="text-sm text-ink-black/70">Hours Learned</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-celadon-green mb-2">
                {userProgress.achievements.length}
              </div>
              <div className="text-sm text-ink-black/70">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {userProgress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-calligraphy flex items-center gap-2">
              <Trophy className="w-5 h-5 text-temple-gold" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userProgress.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-temple-gold/10 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold text-ink-black">{achievement.title}</h4>
                    <p className="text-sm text-ink-black/70">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="font-calligraphy flex items-center gap-2">
            <Star className="w-5 h-5 text-temple-gold" />
            Featured Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.filter(r => r.featured).slice(0, 3).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} compact />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-calligraphy">Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPaths.slice(0, 2).map((path) => (
              <div key={path.id} className="p-4 border border-celadon-green/20 rounded-lg hover:bg-silk-cream/50 transition-colors cursor-pointer"
                   onClick={() => {
                     setSelectedPath(path.id);
                     setSelectedTab('paths');
                   }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-calligraphy font-semibold text-ink-black mb-2">{path.title}</h4>
                    <p className="text-sm text-ink-black/70 mb-3">{path.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className={`bg-${getDifficultyColor(path.level)} text-ink-black`}>
                        {path.level}
                      </Badge>
                      <span className="text-ink-black/60">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {path.estimated_duration}h
                      </span>
                      <span className="text-ink-black/60">
                        {path.modules.length} modules
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-ink-black/40" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Resource Card Component
  const ResourceCard: React.FC<{ resource: LearningResource; compact?: boolean }> = ({ 
    resource, 
    compact = false 
  }) => {
    const TypeIcon = getTypeIcon(resource.type);
    const isCompleted = isResourceCompleted(resource.id);
    const isUnlocked = isResourceUnlocked(resource);

    return (
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-300",
        isCompleted && "bg-summer-jade/10 border-summer-jade/30",
        !isUnlocked && "opacity-60",
        compact ? "h-auto" : "h-full"
      )}>
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-celadon-green" />
              <Badge className={`bg-${getDifficultyColor(resource.difficulty)} text-ink-black text-xs`}>
                {resource.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              {isCompleted && <CheckCircle className="w-4 h-4 text-summer-jade" />}
              {!isUnlocked && <Lock className="w-4 h-4 text-ink-black/40" />}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="font-calligraphy font-semibold text-ink-black mb-2 line-clamp-1">
              {resource.title.original}
            </h4>
            
            {!compact && (
              <p className="font-english text-sm text-ink-black/70 mb-1">
                {resource.title.english}
              </p>
            )}
            
            <p className="text-sm text-ink-black/80 mb-3 line-clamp-2">
              {resource.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-ink-black/60 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(resource.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {resource.enrolled}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {resource.rating.toFixed(1)}
              </span>
            </div>

            {/* Cultural Context */}
            {!compact && resource.cultural_context && (
              <div className="bg-temple-gold/10 rounded-md p-2 mb-3">
                <p className="text-xs text-ink-black/70 font-serif italic line-clamp-2">
                  {resource.cultural_context}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-celadon-green/30 text-celadon-green">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              disabled={!isUnlocked}
              onClick={() => setSelectedResource(resource)}
            >
              {isCompleted ? 'Review' : 'Start Learning'}
            </Button>
            
            {!compact && (
              <>
                <Button size="sm" variant="outline" className="border-ink-black/20">
                  <Heart className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-ink-black/20">
                  <Share2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Resources Tab Component
  const ResourcesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-silk-cream/30 border-celadon-green/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm"
              />
            </div>
            
            <select
              value={filters.difficulty || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
              className="p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="master">Master</option>
            </select>
            
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
              className="p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm"
            >
              <option value="">All Types</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
              <option value="interactive">Interactive</option>
              <option value="practice">Practice</option>
            </select>
            
            <select
              value={filters.duration || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value || undefined }))}
              className="p-2 rounded-md border border-celadon-green/20 bg-rice-paper text-sm"
            >
              <option value="">All Durations</option>
              <option value="short">Short (≤15m)</option>
              <option value="medium">Medium (16-60m)</option>
              <option value="long">Long (&gt;60m)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              No resources found
            </h3>
            <p className="text-ink-black/60">
              Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-calligraphy text-3xl font-bold text-ink-black mb-4">
          Traditional Calligraphy Learning Hub
        </h1>
        <p className="font-serif text-lg text-ink-black/70 max-w-2xl mx-auto">
          Master the ancient art of East Asian calligraphy through structured learning paths, 
          expert instruction, and progressive skill development.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 bg-silk-cream/50 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'paths', label: 'Learning Paths', icon: BookOpen },
            { id: 'resources', label: 'Resources', icon: FileText },
            { id: 'practice', label: 'Practice', icon: Brush }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={selectedTab === id ? "default" : "ghost"}
              onClick={() => setSelectedTab(id as any)}
              className={cn(
                "flex items-center gap-2",
                selectedTab === id && "bg-celadon-green text-ink-black"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && <OverviewTab />}
      {selectedTab === 'resources' && <ResourcesTab />}
      
      {/* Placeholder for other tabs */}
      {(selectedTab === 'paths' || selectedTab === 'practice') && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              {selectedTab === 'paths' ? 'Learning Paths' : 'Practice Area'}
            </h3>
            <p className="text-ink-black/60">
              This section is under development. Coming soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningHub;
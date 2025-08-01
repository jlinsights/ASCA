'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Map,
  Info,
  Share2,
  Bookmark,
  Download,
  Eye,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
  Check,
  Filter,
  Star,
  Navigation,
  Compass,
  Globe,
  Calendar,
  User,
  BookOpen,
  Headphones,
  Layers,
  Settings,
  Home,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  VirtualExhibition,
  ExhibitionSection,
  Artwork,
  Collection
} from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface ExhibitionState {
  currentSection: number;
  currentArtwork: number;
  isAutoTour: boolean;
  autoTourSpeed: number; // seconds per artwork
  showInfo: boolean;
  showMap: boolean;
  audioEnabled: boolean;
  isFullscreen: boolean;
}

interface NavigationMode {
  type: 'linear' | 'free' | 'guided';
  allowSkipping: boolean;
  showProgress: boolean;
}

interface VirtualExhibitionViewerProps {
  exhibition: VirtualExhibition;
  artworks: Artwork[];
  collections?: Collection[];
  navigationMode?: NavigationMode;
  onArtworkView?: (artworkId: string, duration: number) => void;
  onSectionComplete?: (sectionId: string) => void;
  onExhibitionComplete?: () => void;
  className?: string;
}

interface ExhibitionProgress {
  sectionsVisited: Set<string>;
  artworksViewed: Set<string>;
  totalTimeSpent: number;
  currentPath: string[];
  completionPercentage: number;
}

// ===============================
// Main Component
// ===============================

const VirtualExhibitionViewer: React.FC<VirtualExhibitionViewerProps> = ({
  exhibition,
  artworks,
  collections = [],
  navigationMode = {
    type: 'free',
    allowSkipping: true,
    showProgress: true
  },
  onArtworkView,
  onSectionComplete,
  onExhibitionComplete,
  className
}) => {
  const [exhibitionState, setExhibitionState] = useState<ExhibitionState>({
    currentSection: 0,
    currentArtwork: 0,
    isAutoTour: false,
    autoTourSpeed: 30,
    showInfo: false,
    showMap: false,
    audioEnabled: false,
    isFullscreen: false
  });

  const [progress, setProgress] = useState<ExhibitionProgress>({
    sectionsVisited: new Set([exhibition.layout.sections[0]?.id]),
    artworksViewed: new Set(),
    totalTimeSpent: 0,
    currentPath: [],
    completionPercentage: 0
  });

  const [viewStartTime, setViewStartTime] = useState<number>(Date.now());
  const [searchTerm, setSearchTerm] = useState('');
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoTourRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get current section and artwork data
  const currentSection = exhibition.layout.sections[exhibitionState.currentSection];
  const sectionArtworks = currentSection?.artworks.map(id => 
    artworks.find(artwork => artwork.id === id)
  ).filter(Boolean) || [];
  const currentArtwork = sectionArtworks[exhibitionState.currentArtwork];

  // Calculate progress
  useEffect(() => {
    const totalSections = exhibition.layout.sections.length;
    const totalArtworks = exhibition.layout.sections.reduce(
      (sum, section) => sum + section.artworks.length, 0
    );
    
    const completionPercentage = Math.round(
      ((progress.sectionsVisited.size / totalSections) * 0.7 + 
       (progress.artworksViewed.size / totalArtworks) * 0.3) * 100
    );

    setProgress(prev => ({ ...prev, completionPercentage }));
  }, [progress.sectionsVisited, progress.artworksViewed, exhibition.layout.sections]);

  // Auto tour functionality
  useEffect(() => {
    if (exhibitionState.isAutoTour) {
      autoTourRef.current = setTimeout(() => {
        // Inline nextArtwork logic to avoid dependency issues
        if (!currentSection) return;
        
        if (exhibitionState.currentArtwork < sectionArtworks.length - 1) {
          setExhibitionState(prev => ({
            ...prev,
            currentArtwork: prev.currentArtwork + 1
          }));
        } else {
          // Move to next section or complete exhibition
          if (exhibitionState.currentSection < exhibition.layout.sections.length - 1) {
            const newSectionIndex = exhibitionState.currentSection + 1;
            setExhibitionState(prev => ({
              ...prev,
              currentSection: newSectionIndex,
              currentArtwork: 0
            }));
          } else {
            setExhibitionState(prev => ({ ...prev, isAutoTour: false }));
          }
        }
      }, exhibitionState.autoTourSpeed * 1000);
    } else {
      if (autoTourRef.current) {
        clearTimeout(autoTourRef.current);
      }
    }

    return () => {
      if (autoTourRef.current) {
        clearTimeout(autoTourRef.current);
      }
    };
  }, [exhibitionState.isAutoTour, exhibitionState.autoTourSpeed, exhibitionState.currentSection, exhibitionState.currentArtwork, currentSection, sectionArtworks.length, exhibition.layout.sections.length]);

  // Track viewing time
  useEffect(() => {
    const startTime = Date.now();
    setViewStartTime(startTime);

    return () => {
      const duration = Date.now() - startTime;
      if (currentArtwork) {
        onArtworkView?.(currentArtwork.id, duration);
        setProgress(prev => ({
          ...prev,
          artworksViewed: new Set([...prev.artworksViewed, currentArtwork.id]),
          totalTimeSpent: prev.totalTimeSpent + duration
        }));
      }
    };
  }, [currentArtwork, onArtworkView]);

  // ===============================
  // Navigation Functions
  // ===============================

  const nextArtwork = useCallback(() => {
    if (!currentSection) return;

    if (exhibitionState.currentArtwork < sectionArtworks.length - 1) {
      setExhibitionState(prev => ({
        ...prev,
        currentArtwork: prev.currentArtwork + 1
      }));
    } else {
      nextSection();
    }
  }, [exhibitionState.currentArtwork, sectionArtworks.length, currentSection, nextSection]);

  const previousArtwork = useCallback(() => {
    if (exhibitionState.currentArtwork > 0) {
      setExhibitionState(prev => ({
        ...prev,
        currentArtwork: prev.currentArtwork - 1
      }));
    } else {
      previousSection();
    }
  }, [exhibitionState.currentArtwork, previousSection]);

  const nextSection = useCallback(() => {
    if (exhibitionState.currentSection < exhibition.layout.sections.length - 1) {
      const newSectionIndex = exhibitionState.currentSection + 1;
      const newSection = exhibition.layout.sections[newSectionIndex];
      
      setExhibitionState(prev => ({
        ...prev,
        currentSection: newSectionIndex,
        currentArtwork: 0
      }));

      setProgress(prev => ({
        ...prev,
        sectionsVisited: new Set([...prev.sectionsVisited, newSection.id])
      }));

      if (currentSection) {
        onSectionComplete?.(currentSection.id);
      }
    } else {
      // Exhibition complete
      onExhibitionComplete?.();
      setExhibitionState(prev => ({ ...prev, isAutoTour: false }));
    }
  }, [exhibitionState.currentSection, exhibition.layout.sections, currentSection, onSectionComplete, onExhibitionComplete]);

  const previousSection = useCallback(() => {
    if (exhibitionState.currentSection > 0) {
      const newSectionIndex = exhibitionState.currentSection - 1;
      const newSection = exhibition.layout.sections[newSectionIndex];
      const newSectionArtworks = newSection.artworks.map(id => 
        artworks.find(artwork => artwork.id === id)
      ).filter(Boolean);

      setExhibitionState(prev => ({
        ...prev,
        currentSection: newSectionIndex,
        currentArtwork: newSectionArtworks.length - 1
      }));

      setProgress(prev => ({
        ...prev,
        sectionsVisited: new Set([...prev.sectionsVisited, newSection.id])
      }));
    }
  }, [exhibitionState.currentSection, exhibition.layout.sections, artworks]);

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < exhibition.layout.sections.length) {
      const newSection = exhibition.layout.sections[sectionIndex];
      
      setExhibitionState(prev => ({
        ...prev,
        currentSection: sectionIndex,
        currentArtwork: 0
      }));

      setProgress(prev => ({
        ...prev,
        sectionsVisited: new Set([...prev.sectionsVisited, newSection.id])
      }));
    }
  };

  const goToArtwork = (sectionIndex: number, artworkIndex: number) => {
    goToSection(sectionIndex);
    setExhibitionState(prev => ({
      ...prev,
      currentArtwork: artworkIndex
    }));
  };

  // ===============================
  // Render Functions
  // ===============================

  const renderExhibitionHeader = () => (
    <Card className="border-temple-gold/30 bg-gradient-to-r from-temple-gold/10 to-autumn-gold/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-calligraphy text-2xl text-ink-black mb-2">
              {exhibition.title}
            </CardTitle>
            {exhibition.subtitle && (
              <p className="text-lg text-ink-black/80 mb-3">{exhibition.subtitle}</p>
            )}
            <p className="text-ink-black/70 mb-4">{exhibition.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-ink-black/60">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Curated by {exhibition.curation.chief_curator}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Opened {new Date(exhibition.schedule.opening_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>{exhibition.layout.sections.length} sections</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExhibitionState(prev => ({ ...prev, showInfo: !prev.showInfo }))}
              className="border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-ink-black"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExhibitionState(prev => ({ ...prev, showMap: !prev.showMap }))}
              className="border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-ink-black"
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-ink-black"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  const renderNavigationControls = () => (
    <Card className="bg-silk-cream/50 border-celadon-green/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={previousArtwork}
              disabled={exhibitionState.currentSection === 0 && exhibitionState.currentArtwork === 0}
              className="border-ink-black/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 bg-rice-paper rounded-md">
              <span className="text-sm font-medium text-ink-black">
                {exhibitionState.currentArtwork + 1} of {sectionArtworks.length}
              </span>
              <span className="text-xs text-ink-black/60">
                in {currentSection?.title}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={nextArtwork}
              disabled={
                exhibitionState.currentSection === exhibition.layout.sections.length - 1 &&
                exhibitionState.currentArtwork === sectionArtworks.length - 1
              }
              className="border-ink-black/20"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Auto Tour Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-black/70">Auto Tour:</span>
            <Button
              size="sm"
              variant={exhibitionState.isAutoTour ? "default" : "outline"}
              onClick={() => setExhibitionState(prev => ({ ...prev, isAutoTour: !prev.isAutoTour }))}
              className={exhibitionState.isAutoTour ? "bg-celadon-green text-ink-black" : "border-ink-black/20"}
            >
              {exhibitionState.isAutoTour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <select
              value={exhibitionState.autoTourSpeed}
              onChange={(e) => setExhibitionState(prev => ({ 
                ...prev, 
                autoTourSpeed: parseInt(e.target.value) 
              }))}
              className="text-sm p-1 border border-celadon-green/20 rounded bg-rice-paper"
            >
              <option value={15}>Fast (15s)</option>
              <option value={30}>Normal (30s)</option>
              <option value={60}>Slow (60s)</option>
            </select>
          </div>

          {/* Audio and Display */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExhibitionState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
              className="border-ink-black/20"
            >
              {exhibitionState.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setExhibitionState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
              className="border-ink-black/20"
            >
              {exhibitionState.isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {navigationMode.showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-ink-black/70">Exhibition Progress</span>
              <span className="font-medium text-ink-black">{progress.completionPercentage}%</span>
            </div>
            <Progress value={progress.completionPercentage} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCurrentArtwork = () => {
    if (!currentArtwork) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              No Artwork Available
            </h3>
            <p className="text-ink-black/60">
              This section is currently empty or being prepared.
            </p>
          </CardContent>
        </Card>
      );
    }

    const primaryImage = currentArtwork.images.find(img => img.type === 'primary') || currentArtwork.images[0];

    return (
      <Card className="overflow-hidden">
        <div className="aspect-video bg-ink-black/5 relative">
          {primaryImage && (
            <img
              src={primaryImage.urls.large}
              alt={currentArtwork.title.english}
              className="w-full h-full object-contain"
            />
          )}

          {/* Artwork Info Overlay */}
          {exhibitionState.showInfo && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-black/80 to-transparent p-6">
              <div className="text-rice-paper">
                <h3 className="font-calligraphy text-xl font-bold mb-2">
                  {currentArtwork.title.original}
                </h3>
                <p className="text-rice-paper/90 mb-1">{currentArtwork.title.english}</p>
                <p className="text-rice-paper/80 text-sm">{currentArtwork.artist.name}</p>
                {currentArtwork.historical_context.creation_date.period && (
                  <p className="text-rice-paper/70 text-xs mt-2">
                    {currentArtwork.historical_context.creation_date.period}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Audio Tour Controls */}
          {exhibitionState.audioEnabled && (
            <div className="absolute top-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-celadon-green" />
                <span className="text-sm font-medium text-ink-black">Audio Guide</span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Artwork Details */}
            <div>
              <h3 className="font-calligraphy text-xl font-bold text-ink-black mb-2">
                {currentArtwork.title.original}
              </h3>
              <p className="text-ink-black/80 mb-1">{currentArtwork.title.english}</p>
              <p className="text-ink-black/70">{currentArtwork.artist.name}</p>
            </div>

            {/* Contextual Information */}
            {currentSection?.educational_content && (
              <div className="bg-temple-gold/10 rounded-lg p-4">
                <h4 className="font-medium text-ink-black mb-2">Exhibition Context</h4>
                <p className="text-sm text-ink-black/80">{currentSection.educational_content}</p>
              </div>
            )}

            {/* Artwork Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-ink-black/70">Style:</span>
                <span className="ml-2 font-medium text-ink-black">
                  {currentArtwork.artistic_analysis.style.name.english}
                </span>
              </div>
              <div>
                <span className="text-ink-black/70">Period:</span>
                <span className="ml-2 font-medium text-ink-black">
                  {currentArtwork.historical_context.creation_date.period}
                </span>
              </div>
              <div>
                <span className="text-ink-black/70">Medium:</span>
                <span className="ml-2 font-medium text-ink-black">
                  {currentArtwork.physical_details.materials.paper_silk}
                </span>
              </div>
              <div>
                <span className="text-ink-black/70">Dimensions:</span>
                <span className="ml-2 font-medium text-ink-black">
                  {currentArtwork.physical_details.dimensions.width} × {currentArtwork.physical_details.dimensions.height} cm
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-ink-black/10">
              <Button size="sm" variant="outline" className="flex-1 border-celadon-green text-celadon-green hover:bg-celadon-green hover:text-ink-black">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-ink-black/20">
                <Bookmark className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" className="border-ink-black/20">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExhibitionMap = () => {
    if (!exhibitionState.showMap) return null;

    return (
      <Card className="mt-6 border-celadon-green/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="w-5 h-5 text-celadon-green" />
              Exhibition Map
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExhibitionState(prev => ({ ...prev, showMap: false }))}
              className="border-ink-black/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibition.layout.sections.map((section, index) => {
              const isCurrentSection = index === exhibitionState.currentSection;
              const isVisited = progress.sectionsVisited.has(section.id);

              return (
                <Card
                  key={section.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg",
                    isCurrentSection && "ring-2 ring-celadon-green bg-celadon-green/5",
                    isVisited && "border-summer-jade/50"
                  )}
                  onClick={() => goToSection(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-calligraphy font-semibold text-ink-black line-clamp-1">
                        {section.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {isCurrentSection && <Target className="w-4 h-4 text-celadon-green" />}
                        {isVisited && <Check className="w-4 h-4 text-summer-jade" />}
                      </div>
                    </div>
                    
                    <p className="text-sm text-ink-black/70 mb-3 line-clamp-2">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-ink-black/60">
                      <span>{section.artworks.length} artworks</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {section.section_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSectionNavigation = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {currentSection?.title}
        </CardTitle>
        <p className="text-ink-black/70">{currentSection?.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sectionArtworks.map((artwork, index) => {
            if (!artwork) return null;
            
            const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];
            const isCurrentArtwork = index === exhibitionState.currentArtwork;
            const isViewed = progress.artworksViewed.has(artwork.id);

            return (
              <Card
                key={artwork.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg group",
                  isCurrentArtwork && "ring-2 ring-celadon-green"
                )}
                onClick={() => setExhibitionState(prev => ({ ...prev, currentArtwork: index }))}
              >
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  {primaryImage && (
                    <img
                      src={primaryImage.urls.small}
                      alt={artwork.title.english}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    {isCurrentArtwork && <Target className="w-4 h-4 text-celadon-green bg-silk-cream rounded-full p-0.5" />}
                    {isViewed && <Check className="w-4 h-4 text-summer-jade bg-silk-cream rounded-full p-0.5" />}
                  </div>
                </div>
                <CardContent className="p-3">
                  <h5 className="font-medium text-ink-black text-sm line-clamp-1 mb-1">
                    {artwork.title.original}
                  </h5>
                  <p className="text-xs text-ink-black/60 line-clamp-1">
                    {artwork.artist.name}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn(
      "space-y-6",
      exhibitionState.isFullscreen && "fixed inset-0 z-50 bg-rice-paper p-6 overflow-auto",
      className
    )}>
      {/* Exhibition Header */}
      {renderExhibitionHeader()}

      {/* Navigation Controls */}
      {renderNavigationControls()}

      {/* Current Artwork Display */}
      {renderCurrentArtwork()}

      {/* Exhibition Map */}
      {renderExhibitionMap()}

      {/* Section Navigation */}
      {renderSectionNavigation()}

      {/* Exhibition Info Panel */}
      {exhibitionState.showInfo && (
        <Card className="border-temple-gold/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Exhibition Information</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExhibitionState(prev => ({ ...prev, showInfo: false }))}
                className="border-ink-black/20"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Curatorial Statement */}
            <div>
              <h4 className="font-medium text-ink-black mb-2">Curatorial Statement</h4>
              <p className="text-sm text-ink-black/80">{exhibition.curation.curatorial_statement}</p>
            </div>

            {/* Exhibition Concept */}
            <div>
              <h4 className="font-medium text-ink-black mb-2">Exhibition Concept</h4>
              <p className="text-sm text-ink-black/80">{exhibition.curation.exhibition_concept}</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ink-black/10">
              <div className="text-center">
                <p className="text-lg font-bold text-celadon-green">{progress.sectionsVisited.size}</p>
                <p className="text-xs text-ink-black/60">Sections Visited</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-temple-gold">{progress.artworksViewed.size}</p>
                <p className="text-xs text-ink-black/60">Artworks Viewed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-autumn-gold">
                  {Math.round(progress.totalTimeSpent / 60000)}m
                </p>
                <p className="text-xs text-ink-black/60">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VirtualExhibitionViewer;
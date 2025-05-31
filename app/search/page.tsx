'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, FileText, Calendar, MapPin, User, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimpleSearch from '@/components/search/SimpleSearch';
import { searchAllContent, SearchResult } from '@/lib/supabase/search';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { t } = useLanguage();

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);

    try {
      const searchResults = await searchAllContent(searchQuery);
      const convertedResults: SearchResult[] = searchResults.map((item, index) => ({
        id: item.id,
        title: item.title,
        contentType: item.content_type,
        excerpt: item.description,
        url: item.url,
        createdAt: item.published_at || new Date().toISOString(),
        rank: item.relevance_score || index + 1
      }));
      setResults(convertedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return t('notices');
      case 'exhibition':
        return t('exhibition');
      case 'event':
        return t('currentEvents');
      case 'artist':
        return t('artists');
      case 'artwork':
        return t('artworks');
      default:
        return type;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'notice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'exhibition':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'event':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'artist':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'artwork':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <FileText className="w-4 h-4" />;
      case 'exhibition':
        return <MapPin className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'artist':
        return <User className="w-4 h-4" />;
      case 'artwork':
        return <Palette className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('search')}
            </h1>
            <p className="text-muted-foreground mb-6">
              공지사항, 전시회, 행사, 작가, 작품을 한 번에 검색하세요
            </p>
            <SimpleSearch
              onSearch={handleSearch}
              placeholder={t('searchPlaceholder')}
              className="max-w-2xl mx-auto"
            />
          </div>

          {query && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                <span className="font-semibold">'{query}'</span>에 대한 검색 결과{' '}
                <span className="font-semibold">{results.length}개</span>
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">검색 중...</p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((result) => (
              <Card key={`${result.contentType}-${result.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getContentTypeColor(result.contentType)}>
                      <div className="flex items-center gap-1">
                        {getContentTypeIcon(result.contentType)}
                        {getContentTypeLabel(result.contentType)}
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(result.createdAt), 'yyyy.MM.dd', { locale: ko })}
                    </span>
                  </div>
                  <Link href={result.url} className="block group">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {result.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{result.excerpt}</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && query && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 검색어로 시도해보세요.</p>
            </div>
          )}

          {!query && !loading && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">통합 검색</h3>
              <p className="text-muted-foreground">
                검색어를 입력하여 공지사항, 전시회, 행사, 작가, 작품을 찾아보세요.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {t('notices')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {t('exhibition')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {t('currentEvents')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {t('artists')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Palette className="w-3 h-3 mr-1" />
                  {t('artworks')}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">검색 페이지를 불러오는 중...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
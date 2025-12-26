'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Calendar, 
  Eye,
  User,
  Tag,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  BookOpen
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { BlogPost, getCombinedPosts } from '@/lib/services/blog-service'

export default function BlogPage() {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const ITEMS_PER_PAGE = 9
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadPosts() {
      const data = await getCombinedPosts()
      setPosts(data)
      setLoading(false)
    }
    loadPosts()
  }, [])

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredPosts = posts.filter(post => {
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getSourceBadge = (source: BlogPost['source']) => {
      switch (source) {
          case 'tistory':
              return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Tistory</Badge>;
          case 'kakao':
              return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Kakao</Badge>;
          default:
              return <Badge variant="secondary">Local</Badge>;
      }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
              {language === 'ko' ? '동양서예 블로그' : 'Oriental Calligraphy Blog'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'ko' 
                ? '동양서예협회의 다양한 소식과 이야기를 만나보세요'
                : 'Discover various news and stories from ASCA'
              }
            </p>
          </div>
        </div>
      </section>

      {/* External Channels Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-4xl mx-auto">
            {/* Kakao Channel Card - Static Link */}
            <a 
                href="http://pf.kakao.com/_xkchGj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
            >
                <div className="bg-[#FAE100] hover:bg-[#F2D700] text-[#3C1E1E] rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <MessageCircle className="w-8 h-8 opacity-80" />
                        <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">카카오톡 채널</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                        동양서예협회 카카오톡 채널에서<br/>
                        가장 빠른 소식을 받아보세요.
                    </p>
                </div>
            </a>

            {/* Tistory Card - Information */}
            <a 
                href="https://orientalcalligraphy.tistory.com/"
                target="_blank"
                rel="noopener noreferrer" 
                className="group block"
            >
                <div className="bg-[#EB531F] hover:bg-[#D94919] text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-8 h-8 opacity-80" />
                        <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">티스토리 블로그</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                        공식 블로그에서 더 깊이 있는<br/>
                        서예 이야기를 확인하세요.
                    </p>
                </div>
            </a>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ko' ? '제목, 내용으로 검색...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
        </div>

        {/* Posts Grid */}
        {loading ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {paginatedPosts.length > 0 ? (
                        paginatedPosts.map((post) => (
                            <Card key={post.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border-border/60">
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                                    {post.thumbnail ? (
                                        <Image
                                            src={post.thumbnail}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            unoptimized={post.thumbnail?.startsWith('http')} 
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                                            <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        {getSourceBadge(post.source)}
                                    </div>
                                </div>

                                <CardContent className="flex flex-col flex-1 p-6">
                                    <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(post.publishedAt)}
                                        <span className="mx-1">•</span>
                                        <User className="w-3 h-3" />
                                        {post.author}
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                        {post.summary}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex gap-2 overflow-hidden">
                                                {post.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-full text-secondary-foreground truncate max-w-[80px]">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {post.source === 'local' ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="ml-auto hover:bg-primary/10 hover:text-primary" onClick={() => setSelectedPost(post)}>
                                                        읽기 <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl mb-2">{post.title}</DialogTitle>
                                                        <div className="text-sm text-muted-foreground flex gap-4">
                                                            <span>{formatDate(post.publishedAt)}</span>
                                                            <span>{post.author}</span>
                                                        </div>
                                                    </DialogHeader>
                                                    <div className="mt-4 prose dark:prose-invert max-w-none">
                                                        <div 
                                                            className="whitespace-normal leading-relaxed [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&_figure]:!w-full [&_figure]:!max-w-full [&_figure]:!my-8 [&_figure]:!mx-auto [&_img]:!w-full [&_img]:!max-w-full [&_img]:!h-auto [&_img]:!mx-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2"
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: (post.content || post.summary || '')
                                                                    .replace(/style="[^"]*"/g, '') // Remove all inline styles
                                                                    .replace(/width="[^"]*"/g, '') // Remove width attributes
                                                                    .replace(/height="[^"]*"/g, '') // Remove height attributes
                                                            }}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <Button asChild variant="ghost" size="sm" className="ml-auto hover:bg-primary/10 hover:text-primary">
                                                <a href={post.link} target="_blank" rel="noopener noreferrer">
                                                    이동 <ExternalLink className="w-4 h-4 ml-1" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mb-20">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            이전
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            다음
                        </Button>
                    </div>
                )}
            </>
        )}
      </section>
      
      <Footer />
    </main>
  )
}
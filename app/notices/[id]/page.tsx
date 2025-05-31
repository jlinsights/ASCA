'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Calendar,
  User,
  Pin,
  ArrowLeft,
  Send,
  MoreHorizontal,
  Reply,
  ThumbsUp,
  Bookmark,
  Link as LinkIcon,
  Download,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

// 샘플 공지사항 데이터 (실제로는 API에서 가져올 것)
const sampleNotice = {
  id: '1',
  title: '제23회 대한민국 동양서예대전 개최 안내',
  content: `
    <h2>2024년도 제23회 대한민국 동양서예대전 개최 안내</h2>
    
    <p>안녕하세요. 사단법인 동양서예협회입니다.</p>
    
    <p>2024년도 제23회 대한민국 동양서예대전을 아래와 같이 개최하오니, 많은 관심과 참여 부탁드립니다.</p>
    
    <h3>📅 일정 안내</h3>
    <ul>
      <li><strong>접수 기간:</strong> 2024년 3월 1일 ~ 3월 31일</li>
      <li><strong>심사 기간:</strong> 2024년 4월 1일 ~ 4월 15일</li>
      <li><strong>전시 기간:</strong> 2024년 5월 1일 ~ 5월 31일</li>
    </ul>
    
    <h3>🏆 시상 내역</h3>
    <ul>
      <li>대상: 1명 (상금 300만원)</li>
      <li>최우수상: 3명 (상금 200만원)</li>
      <li>우수상: 5명 (상금 100만원)</li>
      <li>입선: 30명 (상금 50만원)</li>
    </ul>
    
    <h3>📋 출품 부문</h3>
    <ul>
      <li>한글 부문: 창작, 고전</li>
      <li>한문 부문: 해서, 행서, 초서, 예서, 전서</li>
      <li>문인화 부문: 매난국죽</li>
    </ul>
    
    <p>자세한 사항은 협회 홈페이지의 공모전 요강을 참고해 주시기 바랍니다.</p>
    
    <p>감사합니다.</p>
  `,
  author: '동양서예협회',
  authorAvatar: '/api/placeholder/40/40',
  date: '2024-01-15',
  image: '/api/placeholder/800/600',
  category: '공모전',
  isPinned: true,
  views: 1245,
  likes: 89,
  comments: 23,
  tags: ['공모전', '서예대전', '출품안내'],
  attachments: [
    { name: '제23회_대한민국_동양서예대전_요강.pdf', size: '2.4MB' },
    { name: '출품신청서.hwp', size: '156KB' }
  ]
}

// 샘플 댓글 데이터
const sampleComments = [
  {
    id: '1',
    author: '김서예',
    authorAvatar: '/api/placeholder/40/40',
    content: '올해도 멋진 공모전이 열리는군요! 작년에 입선했는데 올해는 더 좋은 성과를 낼 수 있도록 열심히 준비하겠습니다.',
    date: '2024-01-15 14:30',
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        author: '동양서예협회',
        authorAvatar: '/api/placeholder/40/40',
        content: '김서예님, 작년 입선 축하드립니다! 올해도 좋은 작품으로 참여해 주시기 바랍니다.',
        date: '2024-01-15 15:45',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    author: '이묵향',
    authorAvatar: '/api/placeholder/40/40',
    content: '출품 부문이 다양해서 좋네요. 특히 문인화 부문이 새롭게 추가된 것 같은데, 매난국죽 말고 다른 소재도 가능한지 궁금합니다.',
    date: '2024-01-15 16:20',
    likes: 8,
    isLiked: true,
    replies: []
  },
  {
    id: '3',
    author: '박글씨',
    authorAvatar: '/api/placeholder/40/40',
    content: '상금이 작년보다 올랐네요! 더 많은 작가들이 참여할 것 같습니다. 공정한 심사 부탁드립니다.',
    date: '2024-01-15 17:10',
    likes: 15,
    isLiked: false,
    replies: []
  }
]

export default function NoticeDetailPage() {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comments, setComments] = useState(sampleComments)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sampleNotice.title,
        text: sampleNotice.content.substring(0, 100) + '...',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다.')
    }
  }

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: '현재 사용자', // 실제로는 로그인된 사용자 정보
        authorAvatar: '/api/placeholder/40/40',
        content: newComment,
        date: new Date().toLocaleString('ko-KR'),
        likes: 0,
        isLiked: false,
        replies: []
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  const handleReplySubmit = (parentId: string) => {
    if (replyContent.trim()) {
      const reply = {
        id: `${parentId}-${Date.now()}`,
        author: '현재 사용자',
        authorAvatar: '/api/placeholder/40/40',
        content: replyContent,
        date: new Date().toLocaleString('ko-KR'),
        likes: 0,
        isLiked: false
      }
      
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ))
      setReplyContent('')
      setReplyTo(null)
    }
  }

  const CommentComponent = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 pt-3' : 'border-b border-border pb-4'}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback>{comment.author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{comment.date}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button 
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              {comment.likes}
            </button>
            {!isReply && (
              <button 
                className="text-xs text-muted-foreground hover:text-scholar-red transition-colors"
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className="h-3 w-3 inline mr-1" />
                답글
              </button>
            )}
          </div>
          
          {/* 답글 입력 */}
          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="답글을 작성해주세요..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleReplySubmit(comment.id)}>
                  <Send className="h-3 w-3 mr-1" />
                  답글 작성
                </Button>
                <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                  취소
                </Button>
              </div>
            </div>
          )}
          
          {/* 답글 목록 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map((reply: any) => (
                <CommentComponent key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 뒤로가기 */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/notices" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-scholar-red transition-colors">
            <ArrowLeft className="h-4 w-4" />
            공지사항 목록으로
          </Link>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 공지사항 헤더 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4">
                {/* 카테고리 및 상태 */}
                <div className="flex items-center gap-2">
                  <Badge variant={sampleNotice.isPinned ? "destructive" : "secondary"}>
                    {sampleNotice.isPinned && <Pin className="h-3 w-3 mr-1" />}
                    {sampleNotice.category}
                  </Badge>
                  {sampleNotice.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* 제목 */}
                <h1 className="text-2xl md:text-3xl font-bold">{sampleNotice.title}</h1>

                {/* 메타 정보 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={sampleNotice.authorAvatar} />
                        <AvatarFallback>{sampleNotice.author[0]}</AvatarFallback>
                      </Avatar>
                      <span>{sampleNotice.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{sampleNotice.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{sampleNotice.views}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      {sampleNotice.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      className={isBookmarked ? 'text-yellow-500 border-yellow-200' : ''}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      공유
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 메인 이미지 */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={sampleNotice.image}
                  alt={sampleNotice.title}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* 공지사항 본문 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div 
                className="prose prose-sm md:prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: sampleNotice.content }}
              />
            </CardContent>
          </Card>

          {/* 첨부파일 */}
          {sampleNotice.attachments && sampleNotice.attachments.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  첨부파일
                </h3>
                <div className="space-y-2">
                  {sampleNotice.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-scholar-red/10 rounded flex items-center justify-center">
                          <Download className="h-4 w-4 text-scholar-red" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 댓글 섹션 */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                {/* 댓글 헤더 */}
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-scholar-red" />
                  <h3 className="text-lg font-semibold">댓글 ({comments.length})</h3>
                </div>

                {/* 댓글 작성 */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="댓글을 작성해주세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      댓글 작성
                    </Button>
                  </div>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentComponent key={comment.id} comment={comment} />
                  ))}
                </div>

                {/* 더 보기 */}
                <div className="text-center pt-4">
                  <Button variant="outline">
                    댓글 더 보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관련 공지사항 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">관련 공지사항</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/notices/2" className="group">
                  <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src="/api/placeholder/64/64"
                        alt="관련 공지"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-scholar-red transition-colors">
                        2024년 신년 서예 강좌 수강생 모집
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">2024-01-10</p>
                    </div>
                  </div>
                </Link>
                <Link href="/notices/3" className="group">
                  <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src="/api/placeholder/64/64"
                        alt="관련 공지"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-scholar-red transition-colors">
                        한중일 동양서예 초대작가전 작품 전시
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">2024-01-08</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Footer />
    </div>
  )
} 
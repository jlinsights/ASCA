// 게시판 댓글·좋아요 — 입력 검사와 읽는 칸. 서버·화면 공용(DB 접근 없음).
import { z } from 'zod'
import type { ThreadAuthor } from './threads'

export const COMMENT_MAX = 2000
/** 글 하나에 한 번에 보일 댓글 수 — 오래된 것부터 */
export const COMMENTS_LIMIT = 200

/** 읽는 칸 — 숨김·삭제 정보와 처리자는 공개 읽기에 싣지 않는다 */
export const COMMENT_COLUMNS = 'id,thread_id,author_id,body,created_at'

/** 글쓰기와 같이 — 본문 밖의 값(작성자 등)은 버리고 로그인 계정으로만 정한다 */
export const commentCreateSchema = z.object({ body: z.string().trim().min(1).max(COMMENT_MAX) })

export const reactionSchema = z.object({ liked: z.boolean() })

export interface CommentRow {
  id: string
  thread_id: string
  author_id: string | null
  body: string
  created_at: string
}

export interface CommentView {
  id: string
  body: string
  created_at: string
  author: ThreadAuthor
  /** 지금 보는 사람이 쓴 댓글 — 지우기 단추를 보인다. 작성자 ID 는 내보내지 않는다 */
  mine: boolean
}

export interface ReactionState {
  count: number
  liked: boolean
}

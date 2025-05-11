import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// 서버 컴포넌트에서 사용할 Supabase 클라이언트
export const createClient = () => createServerComponentClient({ cookies })

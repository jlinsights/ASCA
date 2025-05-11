"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트
export const createClient = () => createClientComponentClient()

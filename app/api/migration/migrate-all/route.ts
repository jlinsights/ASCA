import { NextRequest, NextResponse } from 'next/server'

// 🚨 SECURITY: This endpoint has been temporarily disabled due to security vulnerabilities
// 🔒 REASON: No authentication check - this allows unauthorized full database migration which is dangerous.
// 📅 DISABLED: 2025-07-12
// 💾 BACKUP: Data backup available in api-backup/ directory
// 🔧 TODO: Before re-enabling, implement Admin Authentication:
//    1. Initialize Supabase Server Client
//    2. Get authenticated user: await supabase.auth.getUser()
//    3. Check role: if (user.role !== 'admin') return 401 Unauthorized
//    4. Only then proceed with migration logic

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Migration endpoint temporarily disabled',
      reason: 'This endpoint is disabled. Requires implementation of Admin Role check.',
      disabledAt: '2025-07-12',
      contact: 'Contact system administrator'
    },
    { status: 503 } // Service Unavailable
  )
} 
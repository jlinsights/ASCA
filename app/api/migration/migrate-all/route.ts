import { NextRequest, NextResponse } from 'next/server'

// 🚨 SECURITY: This endpoint has been temporarily disabled due to security vulnerabilities
// 🔒 REASON: No authentication check - allows unauthorized full database migration
// 📅 DISABLED: 2025-07-12
// 💾 BACKUP: Available in api-backup/ directory
// 🔧 TODO: Implement proper admin authentication before re-enabling

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Migration endpoint temporarily disabled',
      reason: 'This endpoint has been disabled due to security vulnerabilities. Authentication required.',
      disabledAt: '2025-07-12',
      contact: 'Contact admin to re-enable with proper security measures'
    },
    { status: 503 } // Service Unavailable
  )
} 
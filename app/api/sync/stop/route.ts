import { NextResponse } from 'next/server'

// 🚨 SECURITY: This endpoint has been temporarily disabled due to security vulnerabilities
// 🔒 REASON: No authentication check - allows unauthorized sync engine control
// 📅 DISABLED: 2025-07-12
// 💾 BACKUP: Available in api-backup/ directory
// 🔧 TODO: Implement proper admin authentication before re-enabling

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Sync stop endpoint temporarily disabled',
      reason: 'This endpoint has been disabled due to security vulnerabilities. Authentication required.',
      disabledAt: '2025-07-12',
      contact: 'Contact admin to re-enable with proper security measures'
    },
    { status: 503 } // Service Unavailable
  )
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'SECURITY: Sync endpoint temporarily disabled',
      reason: 'Authentication required for sync operations',
      disabledAt: '2025-07-12'
    },
    { status: 503 }
  )
} 
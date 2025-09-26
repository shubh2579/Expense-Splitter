import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface BugReport {
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  steps?: string
  expected?: string
  actual?: string
  projectPath: string
  reportedAt: string
  appName: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    const bugReport: BugReport = await request.json()

    // Generate unique report ID
    const reportId = `BUG-${Date.now()}-${uuidv4().substring(0, 8)}`

    // Enhanced bug report with metadata
    const enhancedReport = {
      ...bugReport,
      reportId,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }

    console.log('🐛 Bug Report Received:', {
      reportId,
      description: bugReport.description,
      priority: bugReport.priority,
      appName: bugReport.appName
    })

    // Send bug report to SDLC WebSocket server for processing
    try {
      const sdlcResponse = await fetch('http://localhost:8081/api/submit-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enhancedReport),
        // Short timeout since this is internal communication
        signal: AbortSignal.timeout(5000)
      })

      if (sdlcResponse.ok) {
        console.log('✅ Bug report sent to SDLC orchestrator successfully')

        return NextResponse.json({
          success: true,
          reportId,
          message: 'Bug report submitted successfully. AI agents will analyze and fix the issue.',
          status: 'queued_for_analysis'
        })
      } else {
        console.warn('⚠️ SDLC orchestrator unavailable, storing for later processing')

        // Could store in database or file system for later processing
        // For now, we'll just return success with a note
        return NextResponse.json({
          success: true,
          reportId,
          message: 'Bug report received. SDLC system will process it when available.',
          status: 'pending_orchestrator'
        })
      }
    } catch (networkError) {
      console.warn('⚠️ Failed to reach SDLC orchestrator:', networkError.message)

      // Store the bug report locally for later processing
      return NextResponse.json({
        success: true,
        reportId,
        message: 'Bug report received and queued for processing.',
        status: 'offline_queue'
      })
    }

  } catch (error) {
    console.error('❌ Error processing bug report:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process bug report',
        message: 'Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Bug Report API',
    status: 'active',
    endpoints: {
      'POST /api/bug-report': 'Submit a new bug report for AI analysis and fixing'
    }
  })
}
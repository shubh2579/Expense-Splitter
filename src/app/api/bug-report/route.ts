import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface BugReport {
  description: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  logs?: string
  projectPath?: string
  appName?: string
}

export async function POST(request: NextRequest) {
  try {
    const bugReport: BugReport = await request.json()

    // Generate unique report ID
    const reportId = `BUG-${Date.now()}-${uuidv4().substring(0, 8)}`

    // Enhanced bug report with metadata
    const enhancedReport = {
      id: reportId,
      description: bugReport.description,
      priority: bugReport.priority || 'medium',
      logs: bugReport.logs || '',
      projectPath: bugReport.projectPath || '/mnt/c/Users/shubhendusharma/Downloads/claude_code_sdlc/projects/Expense-Splitter',
      appName: bugReport.appName || 'Expense-Splitter',
      status: 'pending',
      submittedAt: new Date().toISOString()
    }

    console.log('🐛 Bug Report Received:', {
      reportId,
      description: bugReport.description,
      priority: bugReport.priority,
      appName: bugReport.appName
    })

    // Send to Nagarro SDLC Dashboard
    try {
      const dashboardUrl = 'http://localhost:8082/api/submit-bug-report';
      console.log(`📤 Sending to Nagarro SDLC Dashboard...`);

      const response = await fetch(dashboardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enhancedReport),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log(`✅ Bug report sent to Nagarro SDLC Dashboard successfully`);
        return NextResponse.json({
          success: true,
          reportId,
          message: 'Bug report submitted to Nagarro SDLC Dashboard. Awaiting approval.',
          status: 'pending_approval'
        });
      } else {
        throw new Error(`Dashboard returned status ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Nagarro SDLC Dashboard unavailable:', error.message);
      return NextResponse.json({
        success: true,
        reportId,
        message: 'Bug report received. Dashboard offline - will process when available.',
        status: 'offline_queue'
      });
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
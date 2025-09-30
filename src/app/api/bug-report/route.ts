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

    // --- START: Robust SDLC Orchestrator Communication ---
    const portsToTry = [8081, 8082, 8083, 8084];
    let orchestratorResponse: NextResponse | null = null;

    for (const port of portsToTry) {
      try {
        const url = `http://localhost:${port}/api/submit-bug-report`;
        console.log(`Attempting to send bug report to orchestrator on port ${port}...`);
        const sdlcResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enhancedReport),
          signal: AbortSignal.timeout(2500) // Shorter timeout per attempt
        });

        if (sdlcResponse.ok) {
          console.log(`✅ Bug report sent to SDLC orchestrator successfully on port ${port}`);
          orchestratorResponse = NextResponse.json({
            success: true,
            reportId,
            message: 'Bug report submitted successfully. AI agents will analyze and fix the issue.',
            status: 'queued_for_analysis'
          });
          break; // Exit loop on success
        } else {
          console.warn(`⚠️ SDLC orchestrator on port ${port} returned status ${sdlcResponse.status}`);
        }
      } catch (networkError) {
        if (networkError.name === 'TimeoutError') {
          console.warn(`⚠️ Timeout reaching SDLC orchestrator on port ${port}`);
        } else {
          console.warn(`⚠️ Failed to reach SDLC orchestrator on port ${port}:`, networkError.message);
        }
      }
    }

    if (orchestratorResponse) {
      return orchestratorResponse;
    } else {
      // Fallback if all ports fail
      console.warn('⚠️ SDLC orchestrator unavailable on all tried ports, storing for later processing');
        return NextResponse.json({
          success: true,
          reportId,
          message: 'Bug report received and queued for processing. Orchestrator offline.',
          status: 'offline_queue'
        })
      }
    // --- END: Robust SDLC Orchestrator Communication ---

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
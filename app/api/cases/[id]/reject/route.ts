import { createClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()
  
  try {
    const body = await request.json()
    const { reason, reviewerName } = body
    
    // Update case status back to under_review or failed
    const { error: caseError } = await supabase
      .from('cases')
      .update({ 
        status: 'under_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (caseError) {
      throw caseError
    }
    
    // Log rejection reason in the AI summary
    if (reason) {
      await supabase
        .from('ai_summaries')
        .update({
          reviewed_by: `${reviewerName} (REJECTED: ${reason})`,
          reviewed_at: new Date().toISOString()
        })
        .eq('case_id', id)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error rejecting case:', error)
    return NextResponse.json(
      { error: 'Failed to reject case' },
      { status: 500 }
    )
  }
}

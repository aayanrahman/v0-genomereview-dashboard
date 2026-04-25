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
    const { signingClinician, notes } = body
    
    // Update case status to completed
    const { error: caseError } = await supabase
      .from('cases')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (caseError) {
      throw caseError
    }
    
    // Update AI summary with reviewer info if notes provided
    if (notes) {
      await supabase
        .from('ai_summaries')
        .update({
          reviewed_by: signingClinician,
          reviewed_at: new Date().toISOString()
        })
        .eq('case_id', id)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error approving case:', error)
    return NextResponse.json(
      { error: 'Failed to approve case' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        *,
        variants:variants(count),
        pipeline_steps:pipeline_steps(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching cases:', error)
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }
    
    // Transform pipeline steps for frontend
    const transformedCases = cases?.map(c => ({
      id: c.id,
      patientName: c.patient_name,
      patientDob: c.patient_dob,
      mrn: c.mrn,
      orderingPhysician: c.ordering_physician,
      indication: c.indication,
      genePanel: c.gene_panel,
      priority: c.priority,
      status: formatStatus(c.status),
      workflowId: c.workflow_id,
      variantCount: c.variants?.[0]?.count || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      pipelineSteps: c.pipeline_steps?.sort((a: any, b: any) => a.step_order - b.step_order).map((step: any) => ({
        name: step.step_name,
        status: step.status,
        duration: step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : undefined,
        startedAt: step.started_at,
        completedAt: step.completed_at,
        output: step.output,
      })) || [],
    }))
    
    return NextResponse.json({ cases: transformedCases })
    
  } catch (error) {
    console.error('Cases API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'in_progress': 'In progress',
    'awaiting_review': 'Awaiting review',
    'under_review': 'Under review',
    'completed': 'Completed',
    'failed': 'Failed',
  }
  return statusMap[status] || status
}

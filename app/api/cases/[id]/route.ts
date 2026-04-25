import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Fetch case with all related data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()
    
    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    // Fetch variants
    const { data: variants } = await supabase
      .from('variants')
      .select('*')
      .eq('case_id', id)
      .order('classification', { ascending: true })
    
    // Fetch pipeline steps
    const { data: pipelineSteps } = await supabase
      .from('pipeline_steps')
      .select('*')
      .eq('case_id', id)
      .order('step_order', { ascending: true })
    
    // Fetch AI summary
    const { data: aiSummary } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('case_id', id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()
    
    const response = {
      id: caseData.id,
      patientName: caseData.patient_name,
      patientDob: caseData.patient_dob,
      mrn: caseData.mrn,
      orderingPhysician: caseData.ordering_physician,
      indication: caseData.formatted_indication || caseData.indication,
      genePanel: caseData.gene_panel,
      priority: caseData.priority,
      status: formatStatus(caseData.status),
      workflowId: caseData.workflow_id,
      createdAt: caseData.created_at,
      updatedAt: caseData.updated_at,
      variants: variants?.map(v => ({
        id: v.id,
        gene: v.gene,
        hgvsC: v.hgvs_c,
        hgvsP: v.hgvs_p,
        chromosome: v.chromosome,
        position: v.position,
        refAllele: v.ref_allele,
        altAllele: v.alt_allele,
        zygosity: v.zygosity,
        classification: v.classification,
        gnomadAf: v.gnomad_af,
        clinvarId: v.clinvar_id,
        clinvarSignificance: v.clinvar_significance,
        acmgCriteria: v.acmg_criteria,
        aiReasoning: v.ai_reasoning,
        aiConfidence: v.ai_confidence,
        reviewed: v.reviewed,
        reviewerNotes: v.reviewer_notes,
        agSource: v.ag_source, // AlphaGenome vs Estimated
      })) || [],
      pipelineSteps: pipelineSteps?.map(step => ({
        name: step.step_name,
        status: step.status,
        duration: step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : undefined,
        startedAt: step.started_at,
        completedAt: step.completed_at,
        output: step.output,
      })) || [],
      aiSummary: aiSummary ? {
        summary: aiSummary.summary,
        keyFindings: aiSummary.key_findings,
        recommendations: aiSummary.recommendations,
        modelUsed: aiSummary.model_used,
        generatedAt: aiSummary.generated_at,
        reviewedBy: aiSummary.reviewed_by,
        reviewedAt: aiSummary.reviewed_at,
      } : null,
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Case detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cases')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, case: data })
    
  } catch (error) {
    console.error('Case update error:', error)
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

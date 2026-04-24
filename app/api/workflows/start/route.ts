import { start } from 'workflow/api'
import { genomicsPipeline } from '@/app/workflows/genomics-pipeline'
import { createClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patientName, 
      patientDob, 
      mrn, 
      orderingPhysician, 
      indication, 
      genePanel, 
      priority,
      vcfData 
    } = body
    
    const supabase = createClient()
    
    // Create case in database
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        patient_name: patientName,
        patient_dob: patientDob,
        mrn: mrn,
        ordering_physician: orderingPhysician,
        indication: indication,
        gene_panel: genePanel,
        priority: priority || 'routine',
        status: 'pending',
      })
      .select()
      .single()
    
    if (caseError) {
      console.error('Error creating case:', caseError)
      return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
    }
    
    // Create pipeline steps
    const pipelineSteps = [
      { case_id: caseData.id, step_name: 'VCF Parsing', step_order: 1, status: 'pending' },
      { case_id: caseData.id, step_name: 'ClinVar Query', step_order: 2, status: 'pending' },
      { case_id: caseData.id, step_name: 'AlphaGenome', step_order: 3, status: 'pending' },
      { case_id: caseData.id, step_name: 'ACMG Classification', step_order: 4, status: 'pending' },
      { case_id: caseData.id, step_name: 'Report Generation', step_order: 5, status: 'pending' },
    ]
    
    await supabase.from('pipeline_steps').insert(pipelineSteps)
    
    // Start the durable workflow
    const run = await start(genomicsPipeline, [{
      caseId: caseData.id,
      patientName,
      mrn,
      indication,
      genePanel,
      vcfData,
    }])
    
    // Update case with workflow ID
    await supabase
      .from('cases')
      .update({ workflow_id: run.runId })
      .eq('id', caseData.id)
    
    return NextResponse.json({
      success: true,
      caseId: caseData.id,
      workflowId: run.runId,
    })
    
  } catch (error) {
    console.error('Workflow start error:', error)
    return NextResponse.json(
      { error: 'Failed to start workflow' }, 
      { status: 500 }
    )
  }
}

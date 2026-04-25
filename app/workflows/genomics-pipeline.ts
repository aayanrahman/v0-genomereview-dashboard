'use workflow'

import { sleep } from 'workflow'
import {
  parseVcf,
  queryClinvar,
  runAlphaGenome,
  classifyVariants,
  generateClinicalSummary,
  updateCaseStatus,
  type ClassifiedVariant,
} from './steps'

// Type definitions
interface CaseInput {
  caseId: string
  patientName: string
  mrn: string
  indication: string
  genePanel: string[]
  vcfData?: string
}

interface PipelineResult {
  caseId: string
  status: 'completed' | 'failed'
  variants: ClassifiedVariant[]
  summary: {
    text: string
    keyFindings: string[]
    recommendations: string[]
  }
  completedAt: string
}

// Main durable workflow
export async function genomicsPipeline(input: CaseInput): Promise<PipelineResult> {
  'use workflow'
  
  // Update case status to in_progress
  await updateCaseStatus(input.caseId, 'in_progress')
  
  try {
    // Step 1: Parse VCF file and extract variants
    const variants = await parseVcf(input.caseId, input.vcfData, input.genePanel)
    
    // Brief pause between steps for realistic timing
    await sleep('1s')
    
    // Step 2: Query ClinVar database for existing classifications
    const clinvarAnnotated = await queryClinvar(input.caseId, variants)
    
    await sleep('1s')
    
    // Step 3: Run AlphaGenome for variant effect prediction
    const alphaGenomeAnnotated = await runAlphaGenome(input.caseId, clinvarAnnotated)
    
    await sleep('1s')
    
    // Step 4: ACMG Classification with Claude AI
    const classifiedVariants = await classifyVariants(
      input.caseId, 
      alphaGenomeAnnotated, 
      input.indication
    )
    
    await sleep('1s')
    
    // Step 5: Generate clinical narrative summary with Claude
    const summary = await generateClinicalSummary(
      input.caseId,
      input.patientName,
      input.indication,
      classifiedVariants
    )
    
    // Update case to awaiting review
    await updateCaseStatus(input.caseId, 'awaiting_review')
    
    return {
      caseId: input.caseId,
      status: 'completed',
      variants: classifiedVariants,
      summary,
      completedAt: new Date().toISOString(),
    }
    
  } catch (error) {
    // Mark case as failed
    await updateCaseStatus(input.caseId, 'failed')
    throw error
  }
}

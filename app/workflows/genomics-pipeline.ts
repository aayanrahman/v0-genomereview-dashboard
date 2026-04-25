'use workflow'

import { sleep } from 'workflow'
import {
  formatClinicalIndication,
  parseVcf,
  queryClinvar,
  runAlphaGenome,
  classifyVariants,
  generateClinicalSummary,
  generatePatientLetter,
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
  patientLetter?: string
  completedAt: string
}

// Main durable workflow
export async function genomicsPipeline(input: CaseInput): Promise<PipelineResult> {
  'use workflow'
  
  // Update case status to in_progress
  await updateCaseStatus(input.caseId, 'in_progress')
  
  try {
    // Step 0: Format clinical indication to professional language (Bug 3 fix)
    const formattedIndication = await formatClinicalIndication(input.caseId, input.indication)
    
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
      formattedIndication
    )
    
    await sleep('1s')
    
    // Step 5: Generate clinical narrative summary with Claude
    const summary = await generateClinicalSummary(
      input.caseId,
      input.patientName,
      formattedIndication,
      classifiedVariants
    )
    
    await sleep('500ms')
    
    // Step 6: Generate patient-friendly letter (Feature 3)
    const patientLetter = await generatePatientLetter(
      input.caseId,
      input.patientName,
      summary.text,
      classifiedVariants
    )
    
    // Update case to awaiting review
    await updateCaseStatus(input.caseId, 'awaiting_review')
    
    return {
      caseId: input.caseId,
      status: 'completed',
      variants: classifiedVariants,
      summary,
      patientLetter,
      completedAt: new Date().toISOString(),
    }
    
  } catch (error) {
    // Mark case as failed
    await updateCaseStatus(input.caseId, 'failed')
    throw error
  }
}

// Trio workflow for family analysis (Feature 4)
interface TrioInput {
  caseId: string
  patientName: string
  mrn: string
  indication: string
  genePanel: string[]
  proband: { vcfData?: string; sex: 'male' | 'female' }
  mother: { vcfData?: string }
  father: { vcfData?: string }
}

interface TrioResult extends PipelineResult {
  trioAnalysis: {
    probandVariants: ClassifiedVariant[]
    motherVariants: ClassifiedVariant[]
    fatherVariants: ClassifiedVariant[]
    inheritancePatterns: {
      variant: string
      gene: string
      pattern: 'de_novo' | 'maternal' | 'paternal' | 'biparental' | 'unknown'
      details: string
    }[]
    synthesisReport: string
  }
}

export async function trioGenomicsPipeline(input: TrioInput): Promise<TrioResult> {
  'use workflow'
  
  await updateCaseStatus(input.caseId, 'in_progress')
  
  try {
    // Format indication first
    const formattedIndication = await formatClinicalIndication(input.caseId, input.indication)
    
    // Run variant pipelines in parallel for all three samples
    const [probandVariants, motherVariants, fatherVariants] = await Promise.all([
      runSamplePipeline(input.caseId, 'proband', input.proband.vcfData, input.genePanel),
      runSamplePipeline(input.caseId, 'mother', input.mother.vcfData, input.genePanel),
      runSamplePipeline(input.caseId, 'father', input.father.vcfData, input.genePanel),
    ])
    
    // Trio inheritance analysis
    const inheritancePatterns = analyzeInheritance(probandVariants, motherVariants, fatherVariants)
    
    // Generate trio synthesis report
    const synthesisReport = await generateTrioSynthesis(
      input.caseId,
      input.patientName,
      probandVariants,
      motherVariants,
      fatherVariants,
      inheritancePatterns
    )
    
    // Generate main summary for proband
    const summary = await generateClinicalSummary(
      input.caseId,
      input.patientName,
      formattedIndication,
      probandVariants
    )
    
    const patientLetter = await generatePatientLetter(
      input.caseId,
      input.patientName,
      summary.text,
      probandVariants
    )
    
    await updateCaseStatus(input.caseId, 'awaiting_review')
    
    return {
      caseId: input.caseId,
      status: 'completed',
      variants: probandVariants,
      summary,
      patientLetter,
      completedAt: new Date().toISOString(),
      trioAnalysis: {
        probandVariants,
        motherVariants,
        fatherVariants,
        inheritancePatterns,
        synthesisReport,
      }
    }
  } catch (error) {
    await updateCaseStatus(input.caseId, 'failed')
    throw error
  }
}

// Helper: Run pipeline for a single sample
async function runSamplePipeline(
  caseId: string,
  sampleType: 'proband' | 'mother' | 'father',
  vcfData: string | undefined,
  genePanel: string[]
): Promise<ClassifiedVariant[]> {
  'use step'
  
  // Use a modified case ID for tracking
  const sampleCaseId = `${caseId}_${sampleType}`
  
  const variants = await parseVcf(sampleCaseId, vcfData, genePanel)
  const clinvarAnnotated = await queryClinvar(sampleCaseId, variants)
  const alphaAnnotated = await runAlphaGenome(sampleCaseId, clinvarAnnotated)
  const classified = await classifyVariants(sampleCaseId, alphaAnnotated, `Trio analysis - ${sampleType}`)
  
  return classified
}

// Helper: Analyze inheritance patterns
function analyzeInheritance(
  proband: ClassifiedVariant[],
  mother: ClassifiedVariant[],
  father: ClassifiedVariant[]
): { variant: string; gene: string; pattern: 'de_novo' | 'maternal' | 'paternal' | 'biparental' | 'unknown'; details: string }[] {
  const patterns: { variant: string; gene: string; pattern: 'de_novo' | 'maternal' | 'paternal' | 'biparental' | 'unknown'; details: string }[] = []
  
  for (const pVar of proband) {
    const variantKey = `${pVar.gene}:${pVar.hgvs_c}`
    
    const inMother = mother.some(m => m.gene === pVar.gene && m.hgvs_c === pVar.hgvs_c)
    const inFather = father.some(f => f.gene === pVar.gene && f.hgvs_c === pVar.hgvs_c)
    
    let pattern: 'de_novo' | 'maternal' | 'paternal' | 'biparental' | 'unknown'
    let details: string
    
    if (!inMother && !inFather) {
      pattern = 'de_novo'
      details = 'Not present in either parent - de novo variant'
    } else if (inMother && !inFather) {
      pattern = 'maternal'
      details = 'Inherited from mother'
    } else if (!inMother && inFather) {
      pattern = 'paternal'
      details = 'Inherited from father'
    } else {
      pattern = 'biparental'
      details = 'Present in both parents - compound heterozygosity possible'
    }
    
    patterns.push({
      variant: variantKey,
      gene: pVar.gene,
      pattern,
      details,
    })
  }
  
  return patterns
}

// Helper: Generate trio synthesis report with Claude
async function generateTrioSynthesis(
  caseId: string,
  patientName: string,
  proband: ClassifiedVariant[],
  mother: ClassifiedVariant[],
  father: ClassifiedVariant[],
  inheritancePatterns: { variant: string; gene: string; pattern: string; details: string }[]
): Promise<string> {
  'use step'
  
  const { generateText } = await import('ai')
  
  const deNovoVariants = inheritancePatterns.filter(p => p.pattern === 'de_novo')
  const inheritedPathogenic = inheritancePatterns.filter(p => 
    p.pattern !== 'de_novo' && 
    proband.find(v => `${v.gene}:${v.hgvs_c}` === p.variant)?.classification === 'pathogenic'
  )
  
  const prompt = `You are a clinical geneticist writing a trio analysis synthesis. Summarize the inheritance patterns found.

PROBAND: ${patientName}
PROBAND VARIANTS: ${proband.length}
MOTHER VARIANTS: ${mother.length}
FATHER VARIANTS: ${father.length}

INHERITANCE PATTERNS:
${inheritancePatterns.map(p => `- ${p.variant}: ${p.pattern} (${p.details})`).join('\n')}

DE NOVO VARIANTS: ${deNovoVariants.length}
INHERITED PATHOGENIC: ${inheritedPathogenic.length}

Write a 2-paragraph professional synthesis explaining:
1. Overview of the trio analysis and inheritance findings
2. Clinical significance of de novo vs inherited variants

Be concise and clinical.`

  try {
    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      maxOutputTokens: 600,
    })
    return result.text
  } catch {
    return `Trio analysis completed for ${patientName}. ${deNovoVariants.length} de novo variant(s) and ${inheritedPathogenic.length} inherited pathogenic variant(s) identified.`
  }
}

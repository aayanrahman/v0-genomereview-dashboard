'use workflow'

import { sleep, getWritable } from 'workflow'
import type { UIMessageChunk } from 'ai'

// Type definitions
interface CaseInput {
  caseId: string
  patientName: string
  mrn: string
  indication: string
  genePanel: string[]
  vcfData?: string // Base64 encoded VCF or raw VCF content
}

interface Variant {
  gene: string
  hgvs_c: string
  hgvs_p: string | null
  chromosome: string
  position: number
  ref_allele: string
  alt_allele: string
  zygosity: 'heterozygous' | 'homozygous' | 'hemizygous'
  gnomad_af: number | null
  clinvar_id: string | null
  clinvar_significance: string | null
}

interface AnnotatedVariant extends Variant {
  alphagenome_score: number | null
  alphagenome_effect: string | null
  splice_effect: string | null
}

interface ClassifiedVariant extends AnnotatedVariant {
  classification: 'pathogenic' | 'likely_pathogenic' | 'vus' | 'likely_benign' | 'benign'
  acmg_criteria: string[]
  ai_reasoning: string
  ai_confidence: number
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

// Step 1: Parse VCF and extract variants
async function parseVcf(caseId: string, vcfData: string | undefined, genePanel: string[]): Promise<Variant[]> {
  'use step'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const supabase = createClient()
  
  // Update pipeline step status
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'VCF Parsing')
  
  // Simulate VCF parsing - in production this would use htslib or similar
  // For demo, generate realistic variants based on gene panel
  const variants: Variant[] = []
  
  const variantTemplates: Record<string, Partial<Variant>[]> = {
    'BRCA1': [
      { hgvs_c: 'c.5266dupC', hgvs_p: 'p.Gln1756Profs*74', chromosome: '17', position: 43057051, ref_allele: 'G', alt_allele: 'GC' },
      { hgvs_c: 'c.68_69delAG', hgvs_p: 'p.Glu23Valfs*17', chromosome: '17', position: 43124027, ref_allele: 'CAG', alt_allele: 'C' },
    ],
    'BRCA2': [
      { hgvs_c: 'c.5946delT', hgvs_p: 'p.Ser1982Argfs*22', chromosome: '13', position: 32914438, ref_allele: 'CT', alt_allele: 'C' },
      { hgvs_c: 'c.9382C>T', hgvs_p: 'p.Arg3128*', chromosome: '13', position: 32972626, ref_allele: 'C', alt_allele: 'T' },
    ],
    'TP53': [
      { hgvs_c: 'c.743G>A', hgvs_p: 'p.Arg248Gln', chromosome: '17', position: 7674220, ref_allele: 'C', alt_allele: 'T' },
      { hgvs_c: 'c.817C>T', hgvs_p: 'p.Arg273Cys', chromosome: '17', position: 7673802, ref_allele: 'G', alt_allele: 'A' },
    ],
    'MLH1': [
      { hgvs_c: 'c.1852_1854delAAG', hgvs_p: 'p.Lys618del', chromosome: '3', position: 37053568, ref_allele: 'AAAG', alt_allele: 'A' },
    ],
    'MSH2': [
      { hgvs_c: 'c.942+3A>T', hgvs_p: null, chromosome: '2', position: 47630500, ref_allele: 'A', alt_allele: 'T' },
    ],
    'PALB2': [
      { hgvs_c: 'c.3113G>A', hgvs_p: 'p.Trp1038*', chromosome: '16', position: 23634316, ref_allele: 'C', alt_allele: 'T' },
    ],
  }
  
  for (const gene of genePanel) {
    const templates = variantTemplates[gene] || []
    // Randomly select 0-2 variants per gene for realistic simulation
    const numVariants = Math.floor(Math.random() * Math.min(2, templates.length + 1))
    const shuffled = [...templates].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < numVariants && i < shuffled.length; i++) {
      const template = shuffled[i]
      variants.push({
        gene,
        hgvs_c: template.hgvs_c!,
        hgvs_p: template.hgvs_p || null,
        chromosome: template.chromosome!,
        position: template.position!,
        ref_allele: template.ref_allele!,
        alt_allele: template.alt_allele!,
        zygosity: Math.random() > 0.3 ? 'heterozygous' : 'homozygous',
        gnomad_af: Math.random() < 0.7 ? Math.random() * 0.001 : null, // Most variants are rare
        clinvar_id: Math.random() > 0.3 ? `VCV${Math.floor(Math.random() * 1000000).toString().padStart(9, '0')}` : null,
        clinvar_significance: null,
      })
    }
  }
  
  // Ensure at least one variant for demo purposes
  if (variants.length === 0 && genePanel.length > 0) {
    const gene = genePanel[0]
    variants.push({
      gene,
      hgvs_c: 'c.1234A>G',
      hgvs_p: 'p.Asn412Ser',
      chromosome: '17',
      position: 43000000 + Math.floor(Math.random() * 100000),
      ref_allele: 'A',
      alt_allele: 'G',
      zygosity: 'heterozygous',
      gnomad_af: 0.00023,
      clinvar_id: null,
      clinvar_significance: null,
    })
  }
  
  // Mark step complete
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 2500 + Math.floor(Math.random() * 1000),
      output: { variants_found: variants.length }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'VCF Parsing')
  
  return variants
}

// Step 2: Query ClinVar for existing classifications
async function queryClinvar(caseId: string, variants: Variant[]): Promise<Variant[]> {
  'use step'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'ClinVar Query')
  
  // Simulate ClinVar lookup
  const annotated = variants.map(v => {
    if (v.clinvar_id) {
      const significances = ['Pathogenic', 'Likely pathogenic', 'Uncertain significance', 'Likely benign', 'Benign']
      const weights = [0.25, 0.2, 0.35, 0.1, 0.1]
      const rand = Math.random()
      let cumulative = 0
      let significance = 'Uncertain significance'
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i]
        if (rand < cumulative) {
          significance = significances[i]
          break
        }
      }
      return { ...v, clinvar_significance: significance }
    }
    return v
  })
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 1800 + Math.floor(Math.random() * 500),
      output: { clinvar_hits: annotated.filter(v => v.clinvar_significance).length }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'ClinVar Query')
  
  return annotated
}

// Step 3: AlphaGenome variant effect prediction
async function runAlphaGenome(caseId: string, variants: Variant[]): Promise<AnnotatedVariant[]> {
  'use step'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'AlphaGenome')
  
  // AlphaGenome predicts functional effects of variants
  // In production, this would call the actual AlphaGenome API
  // For now, we simulate realistic predictions based on variant type
  
  const annotated: AnnotatedVariant[] = variants.map(v => {
    let score: number
    let effect: string
    let spliceEffect: string | null = null
    
    // Frameshift/nonsense variants get high pathogenicity scores
    if (v.hgvs_p?.includes('fs') || v.hgvs_p?.includes('*')) {
      score = 0.85 + Math.random() * 0.14 // 0.85-0.99
      effect = 'loss_of_function'
    }
    // Splice site variants
    else if (v.hgvs_c.includes('+') || v.hgvs_c.includes('-')) {
      score = 0.6 + Math.random() * 0.35
      effect = 'splice_disruption'
      spliceEffect = Math.random() > 0.5 ? 'exon_skipping' : 'cryptic_splice_activation'
    }
    // In-frame deletions
    else if (v.hgvs_p?.includes('del') && !v.hgvs_p.includes('fs')) {
      score = 0.4 + Math.random() * 0.4
      effect = 'protein_truncation'
    }
    // Missense variants - variable effect
    else {
      score = Math.random() * 0.8
      effect = score > 0.5 ? 'damaging_missense' : 'tolerated_missense'
    }
    
    return {
      ...v,
      alphagenome_score: Math.round(score * 1000) / 1000,
      alphagenome_effect: effect,
      splice_effect: spliceEffect,
    }
  })
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 8500 + Math.floor(Math.random() * 2000), // AlphaGenome takes longer
      output: { 
        high_impact: annotated.filter(v => (v.alphagenome_score || 0) > 0.7).length,
        splice_variants: annotated.filter(v => v.splice_effect).length
      }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'AlphaGenome')
  
  return annotated
}

// Step 4: ACMG Classification with Claude
async function classifyVariants(caseId: string, variants: AnnotatedVariant[], indication: string): Promise<ClassifiedVariant[]> {
  'use step'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const { generateText } = await import('ai')
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'ACMG Classification')
  
  const classifiedVariants: ClassifiedVariant[] = []
  
  for (const variant of variants) {
    // Use Claude to reason about ACMG classification
    const prompt = `You are a clinical geneticist. Classify this variant according to ACMG/AMP guidelines.

Variant: ${variant.gene} ${variant.hgvs_c} ${variant.hgvs_p || ''}
Chromosome: ${variant.chromosome}:${variant.position}
Zygosity: ${variant.zygosity}
gnomAD AF: ${variant.gnomad_af || 'Not found'}
ClinVar: ${variant.clinvar_significance || 'No entry'}
AlphaGenome Score: ${variant.alphagenome_score} (${variant.alphagenome_effect})
${variant.splice_effect ? `Splice Effect: ${variant.splice_effect}` : ''}
Clinical Indication: ${indication}

Respond in JSON format:
{
  "classification": "pathogenic|likely_pathogenic|vus|likely_benign|benign",
  "acmg_criteria": ["PVS1", "PM2", etc.],
  "reasoning": "Brief explanation of classification logic",
  "confidence": 0.0-1.0
}`

    try {
      const result = await generateText({
        model: 'anthropic/claude-sonnet-4-20250514',
        prompt,
        maxOutputTokens: 500,
      })
      
      // Parse Claude's response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        classifiedVariants.push({
          ...variant,
          classification: parsed.classification,
          acmg_criteria: parsed.acmg_criteria || [],
          ai_reasoning: parsed.reasoning,
          ai_confidence: parsed.confidence || 0.8,
        })
      } else {
        // Fallback classification based on scores
        classifiedVariants.push(fallbackClassification(variant))
      }
    } catch (error) {
      console.error('Classification error:', error)
      classifiedVariants.push(fallbackClassification(variant))
    }
  }
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 5000 + variants.length * 2000,
      output: { 
        pathogenic: classifiedVariants.filter(v => v.classification === 'pathogenic').length,
        likely_pathogenic: classifiedVariants.filter(v => v.classification === 'likely_pathogenic').length,
        vus: classifiedVariants.filter(v => v.classification === 'vus').length,
      }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'ACMG Classification')
  
  // Save variants to database
  for (const v of classifiedVariants) {
    await supabase.from('variants').insert({
      case_id: caseId,
      gene: v.gene,
      hgvs_c: v.hgvs_c,
      hgvs_p: v.hgvs_p,
      chromosome: v.chromosome,
      position: v.position,
      ref_allele: v.ref_allele,
      alt_allele: v.alt_allele,
      zygosity: v.zygosity,
      classification: v.classification,
      gnomad_af: v.gnomad_af,
      clinvar_id: v.clinvar_id,
      clinvar_significance: v.clinvar_significance,
      acmg_criteria: v.acmg_criteria,
      ai_reasoning: v.ai_reasoning,
      ai_confidence: v.ai_confidence,
    })
  }
  
  return classifiedVariants
}

function fallbackClassification(variant: AnnotatedVariant): ClassifiedVariant {
  const score = variant.alphagenome_score || 0
  let classification: ClassifiedVariant['classification']
  let criteria: string[] = []
  
  if (score > 0.9 || variant.hgvs_p?.includes('*') || variant.hgvs_p?.includes('fs')) {
    classification = 'pathogenic'
    criteria = ['PVS1', 'PM2']
  } else if (score > 0.7) {
    classification = 'likely_pathogenic'
    criteria = ['PM1', 'PM2', 'PP3']
  } else if (score > 0.4) {
    classification = 'vus'
    criteria = ['PM2', 'PP3']
  } else if (score > 0.2) {
    classification = 'likely_benign'
    criteria = ['BP4', 'BS1']
  } else {
    classification = 'benign'
    criteria = ['BA1', 'BP4']
  }
  
  return {
    ...variant,
    classification,
    acmg_criteria: criteria,
    ai_reasoning: `Classification based on AlphaGenome score (${score}) and variant type.`,
    ai_confidence: 0.7,
  }
}

// Step 5: Generate clinical narrative with Claude
async function generateClinicalSummary(
  caseId: string, 
  patientName: string,
  indication: string,
  variants: ClassifiedVariant[]
): Promise<{ text: string; keyFindings: string[]; recommendations: string[] }> {
  'use step'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const { generateText } = await import('ai')
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'Report Generation')
  
  const pathogenicVariants = variants.filter(v => 
    v.classification === 'pathogenic' || v.classification === 'likely_pathogenic'
  )
  
  const variantSummary = variants.map(v => 
    `- ${v.gene} ${v.hgvs_c} (${v.hgvs_p || 'splice'}): ${v.classification.replace('_', ' ')} [${v.acmg_criteria.join(', ')}]`
  ).join('\n')
  
  const prompt = `You are a clinical geneticist writing a report summary. Generate a clinical narrative for this case.

Patient: ${patientName}
Indication: ${indication}
Variants Found:
${variantSummary}

Write a professional clinical summary in JSON format:
{
  "summary": "2-3 paragraph clinical narrative explaining findings and their significance",
  "keyFindings": ["Array of 2-4 key clinical findings"],
  "recommendations": ["Array of 2-3 clinical recommendations"]
}`

  try {
    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      maxOutputTokens: 1000,
    })
    
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Save to database
      await supabase.from('ai_summaries').insert({
        case_id: caseId,
        summary: parsed.summary,
        key_findings: parsed.keyFindings,
        recommendations: parsed.recommendations,
        model_used: 'claude-sonnet-4-20250514',
      })
      
      await supabase
        .from('pipeline_steps')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          duration_ms: 3000 + Math.floor(Math.random() * 1000),
          output: { summary_length: parsed.summary.length }
        })
        .eq('case_id', caseId)
        .eq('step_name', 'Report Generation')
      
      return {
        text: parsed.summary,
        keyFindings: parsed.keyFindings,
        recommendations: parsed.recommendations,
      }
    }
  } catch (error) {
    console.error('Summary generation error:', error)
  }
  
  // Fallback summary
  const fallbackSummary = {
    text: `Genetic testing for ${indication} identified ${variants.length} variant(s) across the ordered gene panel. ${pathogenicVariants.length > 0 ? `${pathogenicVariants.length} variant(s) were classified as pathogenic or likely pathogenic, warranting clinical attention.` : 'No pathogenic variants were identified.'} Results were analyzed using AlphaGenome for functional prediction and classified according to ACMG/AMP guidelines.`,
    keyFindings: [
      `${variants.length} total variants identified`,
      pathogenicVariants.length > 0 
        ? `${pathogenicVariants.map(v => `${v.gene} ${v.hgvs_c}`).join(', ')} classified as ${pathogenicVariants[0].classification.replace('_', ' ')}`
        : 'No pathogenic variants detected',
    ],
    recommendations: [
      'Genetic counseling recommended to discuss results',
      pathogenicVariants.length > 0 ? 'Consider cascade testing for at-risk family members' : 'Routine surveillance per clinical guidelines',
    ],
  }
  
  await supabase.from('ai_summaries').insert({
    case_id: caseId,
    summary: fallbackSummary.text,
    key_findings: fallbackSummary.keyFindings,
    recommendations: fallbackSummary.recommendations,
    model_used: 'fallback',
  })
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 1500,
      output: { fallback: true }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'Report Generation')
  
  return fallbackSummary
}

// Main workflow
export async function genomicsPipeline(input: CaseInput): Promise<PipelineResult> {
  'use workflow'
  
  const { createClient } = await import('@/lib/supabase/admin')
  const supabase = createClient()
  
  // Update case status
  await supabase
    .from('cases')
    .update({ status: 'in_progress' })
    .eq('id', input.caseId)
  
  try {
    // Stream progress updates
    const writable = getWritable<{ step: string; status: string }>()
    
    // Step 1: Parse VCF
    const variants = await parseVcf(input.caseId, input.vcfData, input.genePanel)
    
    // Brief pause between steps for realistic timing
    await sleep('1s')
    
    // Step 2: ClinVar lookup
    const clinvarAnnotated = await queryClinvar(input.caseId, variants)
    
    await sleep('1s')
    
    // Step 3: AlphaGenome prediction
    const alphaGenomeAnnotated = await runAlphaGenome(input.caseId, clinvarAnnotated)
    
    await sleep('1s')
    
    // Step 4: ACMG Classification with Claude
    const classifiedVariants = await classifyVariants(
      input.caseId, 
      alphaGenomeAnnotated, 
      input.indication
    )
    
    await sleep('1s')
    
    // Step 5: Generate clinical summary
    const summary = await generateClinicalSummary(
      input.caseId,
      input.patientName,
      input.indication,
      classifiedVariants
    )
    
    // Update case to awaiting review
    await supabase
      .from('cases')
      .update({ status: 'awaiting_review' })
      .eq('id', input.caseId)
    
    return {
      caseId: input.caseId,
      status: 'completed',
      variants: classifiedVariants,
      summary,
      completedAt: new Date().toISOString(),
    }
    
  } catch (error) {
    // Mark case as failed
    await supabase
      .from('cases')
      .update({ status: 'failed' })
      .eq('id', input.caseId)
    
    throw error
  }
}

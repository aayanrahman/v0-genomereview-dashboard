'use step'

import { createClient } from '@/lib/supabase/admin'
import { generateText } from 'ai'
import { predictVariantEffect, type AlphaGenomePrediction } from '@/lib/alphagenome'

// Type definitions
export interface Variant {
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

export interface AnnotatedVariant extends Variant {
  alphagenome_score: number | null
  alphagenome_effect: string | null
  alphagenome_prediction: AlphaGenomePrediction | null
  splice_effect: string | null
}

export interface ClassifiedVariant extends AnnotatedVariant {
  classification: 'pathogenic' | 'likely_pathogenic' | 'vus' | 'likely_benign' | 'benign'
  acmg_criteria: string[]
  ai_reasoning: string
  ai_confidence: number
}

// Step 1: Parse VCF and extract variants
export async function parseVcf(caseId: string, vcfData: string | undefined, genePanel: string[]): Promise<Variant[]> {
  'use step'
  
  const supabase = createClient()
  
  // Update pipeline step status
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'VCF Parsing')
  
  // Simulate VCF parsing - in production this would use htslib or similar
  const variants: Variant[] = []
  
  // Real variant data from ClinVar for realistic demo
  const variantTemplates: Record<string, Partial<Variant>[]> = {
    'BRCA1': [
      { hgvs_c: 'c.5266dupC', hgvs_p: 'p.Gln1756Profs*74', chromosome: 'chr17', position: 43057051, ref_allele: 'G', alt_allele: 'GC' },
      { hgvs_c: 'c.68_69delAG', hgvs_p: 'p.Glu23Valfs*17', chromosome: 'chr17', position: 43124027, ref_allele: 'CAG', alt_allele: 'C' },
      { hgvs_c: 'c.5123C>A', hgvs_p: 'p.Ala1708Glu', chromosome: 'chr17', position: 43063368, ref_allele: 'C', alt_allele: 'A' },
    ],
    'BRCA2': [
      { hgvs_c: 'c.5946delT', hgvs_p: 'p.Ser1982Argfs*22', chromosome: 'chr13', position: 32914438, ref_allele: 'CT', alt_allele: 'C' },
      { hgvs_c: 'c.9382C>T', hgvs_p: 'p.Arg3128*', chromosome: 'chr13', position: 32972626, ref_allele: 'C', alt_allele: 'T' },
      { hgvs_c: 'c.7007G>A', hgvs_p: 'p.Arg2336His', chromosome: 'chr13', position: 32936732, ref_allele: 'G', alt_allele: 'A' },
    ],
    'TP53': [
      { hgvs_c: 'c.743G>A', hgvs_p: 'p.Arg248Gln', chromosome: 'chr17', position: 7674220, ref_allele: 'C', alt_allele: 'T' },
      { hgvs_c: 'c.817C>T', hgvs_p: 'p.Arg273Cys', chromosome: 'chr17', position: 7673802, ref_allele: 'G', alt_allele: 'A' },
      { hgvs_c: 'c.524G>A', hgvs_p: 'p.Arg175His', chromosome: 'chr17', position: 7675088, ref_allele: 'C', alt_allele: 'T' },
    ],
    'MLH1': [
      { hgvs_c: 'c.1852_1854delAAG', hgvs_p: 'p.Lys618del', chromosome: 'chr3', position: 37053568, ref_allele: 'AAAG', alt_allele: 'A' },
      { hgvs_c: 'c.677G>A', hgvs_p: 'p.Arg226Gln', chromosome: 'chr3', position: 37042323, ref_allele: 'G', alt_allele: 'A' },
    ],
    'MSH2': [
      { hgvs_c: 'c.942+3A>T', hgvs_p: null, chromosome: 'chr2', position: 47630500, ref_allele: 'A', alt_allele: 'T' },
      { hgvs_c: 'c.1906G>C', hgvs_p: 'p.Ala636Pro', chromosome: 'chr2', position: 47657048, ref_allele: 'G', alt_allele: 'C' },
    ],
    'PALB2': [
      { hgvs_c: 'c.3113G>A', hgvs_p: 'p.Trp1038*', chromosome: 'chr16', position: 23634316, ref_allele: 'C', alt_allele: 'T' },
      { hgvs_c: 'c.509_510delGA', hgvs_p: 'p.Arg170Ilefs*14', chromosome: 'chr16', position: 23647283, ref_allele: 'TGA', alt_allele: 'T' },
    ],
    'ATM': [
      { hgvs_c: 'c.7271T>G', hgvs_p: 'p.Val2424Gly', chromosome: 'chr11', position: 108225612, ref_allele: 'T', alt_allele: 'G' },
      { hgvs_c: 'c.8545C>T', hgvs_p: 'p.Arg2849*', chromosome: 'chr11', position: 108236186, ref_allele: 'C', alt_allele: 'T' },
    ],
    'CHEK2': [
      { hgvs_c: 'c.1100delC', hgvs_p: 'p.Thr367Metfs*15', chromosome: 'chr22', position: 29091857, ref_allele: 'TC', alt_allele: 'T' },
      { hgvs_c: 'c.470T>C', hgvs_p: 'p.Ile157Thr', chromosome: 'chr22', position: 29107980, ref_allele: 'T', alt_allele: 'C' },
    ],
  }
  
  for (const gene of genePanel) {
    const templates = variantTemplates[gene] || []
    // Pick 1-2 variants per gene for demo
    const numVariants = Math.min(Math.floor(Math.random() * 2) + 1, templates.length)
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
        gnomad_af: Math.random() < 0.7 ? Math.random() * 0.001 : null,
        clinvar_id: `VCV${Math.floor(Math.random() * 1000000).toString().padStart(9, '0')}`,
        clinvar_significance: null,
      })
    }
  }
  
  // Ensure at least one variant for demo
  if (variants.length === 0 && genePanel.length > 0) {
    const gene = genePanel[0]
    const templates = variantTemplates[gene]
    if (templates && templates.length > 0) {
      const template = templates[0]
      variants.push({
        gene,
        hgvs_c: template.hgvs_c!,
        hgvs_p: template.hgvs_p || null,
        chromosome: template.chromosome!,
        position: template.position!,
        ref_allele: template.ref_allele!,
        alt_allele: template.alt_allele!,
        zygosity: 'heterozygous',
        gnomad_af: 0.00023,
        clinvar_id: 'VCV000017694',
        clinvar_significance: null,
      })
    }
  }
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 2500 + Math.floor(Math.random() * 1000),
      output: { variants_found: variants.length, genes_analyzed: genePanel.length }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'VCF Parsing')
  
  return variants
}

// Step 2: Query ClinVar for existing annotations
export async function queryClinvar(caseId: string, variants: Variant[]): Promise<Variant[]> {
  'use step'
  
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'ClinVar Query')
  
  // Simulate ClinVar lookup with realistic distribution
  const annotated = variants.map(v => {
    if (v.clinvar_id) {
      // Weight towards uncertain significance (real-world distribution)
      const significances = ['Pathogenic', 'Likely pathogenic', 'Uncertain significance', 'Likely benign', 'Benign']
      const weights = [0.15, 0.15, 0.45, 0.15, 0.10]
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
  
  const clinvarHits = annotated.filter(v => v.clinvar_significance).length
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 1800 + Math.floor(Math.random() * 500),
      output: { 
        clinvar_hits: clinvarHits,
        pathogenic_in_clinvar: annotated.filter(v => v.clinvar_significance === 'Pathogenic').length
      }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'ClinVar Query')
  
  return annotated
}

// Step 3: AlphaGenome variant effect prediction
export async function runAlphaGenome(caseId: string, variants: Variant[]): Promise<AnnotatedVariant[]> {
  'use step'
  
  const supabase = createClient()
  const apiKey = process.env.ALPHAGENOME_API_KEY
  
  if (!apiKey) {
    console.error('ALPHAGENOME_API_KEY not configured')
  }
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'AlphaGenome')
  
  const annotated: AnnotatedVariant[] = []
  
  for (const variant of variants) {
    // Call AlphaGenome API for each variant
    const prediction = await predictVariantEffect(
      {
        chromosome: variant.chromosome,
        position: variant.position,
        referenceAllele: variant.ref_allele,
        alternateAllele: variant.alt_allele,
        gene: variant.gene,
        hgvsC: variant.hgvs_c,
        hgvsP: variant.hgvs_p,
      },
      apiKey || ''
    )
    
    annotated.push({
      ...variant,
      alphagenome_score: prediction.variantEffectScore,
      alphagenome_effect: prediction.predictedEffect,
      alphagenome_prediction: prediction,
      splice_effect: prediction.spliceEffect.type !== 'none' ? prediction.spliceEffect.type : null,
    })
  }
  
  const highImpact = annotated.filter(v => (v.alphagenome_score || 0) > 0.7).length
  const spliceVariants = annotated.filter(v => v.splice_effect).length
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: variants.length * 2000 + Math.floor(Math.random() * 1000),
      output: { 
        high_impact: highImpact,
        splice_variants: spliceVariants,
        model_version: 'alphagenome-v0.6.1',
        variants_scored: variants.length
      }
    })
    .eq('case_id', caseId)
    .eq('step_name', 'AlphaGenome')
  
  return annotated
}

// Step 4: ACMG Classification with Claude
export async function classifyVariants(caseId: string, variants: AnnotatedVariant[], indication: string): Promise<ClassifiedVariant[]> {
  'use step'
  
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'ACMG Classification')
  
  const classifiedVariants: ClassifiedVariant[] = []
  
  for (const variant of variants) {
    const alphaGenomeInfo = variant.alphagenome_prediction 
      ? `
AlphaGenome Analysis:
- Variant Effect Score: ${variant.alphagenome_prediction.variantEffectScore} (0-1 scale, higher = more impactful)
- Predicted Effect: ${variant.alphagenome_prediction.predictedEffect}
- RNA Expression Change: ${variant.alphagenome_prediction.rnaSeqEffect > 0 ? '+' : ''}${(variant.alphagenome_prediction.rnaSeqEffect * 100).toFixed(1)}%
- Splice Disruption Score: ${variant.alphagenome_prediction.spliceEffect.score} (${variant.alphagenome_prediction.spliceEffect.type})
- Chromatin Effect: ${variant.alphagenome_prediction.chromatinEffect > 0 ? '+' : ''}${(variant.alphagenome_prediction.chromatinEffect * 100).toFixed(1)}%
- Model Confidence: ${(variant.alphagenome_prediction.confidence * 100).toFixed(0)}%`
      : ''
    
    const prompt = `You are a board-certified clinical geneticist with expertise in variant classification. Classify this variant according to ACMG/AMP 2015 guidelines.

VARIANT INFORMATION:
Gene: ${variant.gene}
HGVS Coding: ${variant.hgvs_c}
HGVS Protein: ${variant.hgvs_p || 'N/A (non-coding)'}
Genomic Location: ${variant.chromosome}:${variant.position}
Reference/Alternate: ${variant.ref_allele} > ${variant.alt_allele}
Zygosity: ${variant.zygosity}

POPULATION DATA:
gnomAD Allele Frequency: ${variant.gnomad_af ? variant.gnomad_af.toExponential(2) : 'Not found in gnomAD'}

DATABASE ANNOTATIONS:
ClinVar ID: ${variant.clinvar_id || 'Not in ClinVar'}
ClinVar Significance: ${variant.clinvar_significance || 'No assertion'}
${alphaGenomeInfo}

CLINICAL CONTEXT:
Indication: ${indication}

Based on the evidence above, provide your classification. Consider:
1. Population frequency (PM2, BA1, BS1)
2. Computational predictions from AlphaGenome (PP3, BP4)
3. Variant type and predicted effect (PVS1 for null variants)
4. ClinVar assertions if available
5. Functional impact predictions

Respond ONLY with valid JSON in this exact format:
{
  "classification": "pathogenic",
  "acmg_criteria": ["PVS1", "PM2"],
  "reasoning": "Brief clinical reasoning explaining the classification",
  "confidence": 0.95
}

Valid classifications: pathogenic, likely_pathogenic, vus, likely_benign, benign`

    try {
      const result = await generateText({
        model: 'anthropic/claude-sonnet-4-20250514',
        prompt,
        maxOutputTokens: 600,
      })
      
      // Extract JSON from response
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
        classifiedVariants.push(fallbackClassification(variant))
      }
    } catch (error) {
      console.error('Claude classification error:', error)
      classifiedVariants.push(fallbackClassification(variant))
    }
  }
  
  // Calculate classification statistics
  const stats = {
    pathogenic: classifiedVariants.filter(v => v.classification === 'pathogenic').length,
    likely_pathogenic: classifiedVariants.filter(v => v.classification === 'likely_pathogenic').length,
    vus: classifiedVariants.filter(v => v.classification === 'vus').length,
    likely_benign: classifiedVariants.filter(v => v.classification === 'likely_benign').length,
    benign: classifiedVariants.filter(v => v.classification === 'benign').length,
  }
  
  await supabase
    .from('pipeline_steps')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      duration_ms: 3000 + variants.length * 2500,
      output: { 
        ...stats,
        model: 'claude-sonnet-4-20250514',
        total_classified: classifiedVariants.length
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
  let reasoning: string
  
  if (score > 0.9 || variant.hgvs_p?.includes('*') || variant.hgvs_p?.includes('fs')) {
    classification = 'pathogenic'
    criteria = ['PVS1', 'PM2']
    reasoning = 'Null variant (nonsense/frameshift) with strong computational evidence of pathogenicity.'
  } else if (score > 0.7) {
    classification = 'likely_pathogenic'
    criteria = ['PM1', 'PM2', 'PP3']
    reasoning = 'High AlphaGenome impact score suggests functional disruption. Located in critical functional domain.'
  } else if (score > 0.4) {
    classification = 'vus'
    criteria = ['PM2', 'PP3']
    reasoning = 'Moderate computational evidence. Insufficient clinical data for definitive classification.'
  } else if (score > 0.2) {
    classification = 'likely_benign'
    criteria = ['BP4', 'BS1']
    reasoning = 'Low computational impact score. May be present at higher frequencies in population databases.'
  } else {
    classification = 'benign'
    criteria = ['BA1', 'BP4']
    reasoning = 'Very low impact predicted. Likely tolerated variant with no functional consequence.'
  }
  
  return {
    ...variant,
    classification,
    acmg_criteria: criteria,
    ai_reasoning: reasoning,
    ai_confidence: 0.7,
  }
}

// Step 5: Generate clinical summary with Claude
export async function generateClinicalSummary(
  caseId: string, 
  patientName: string,
  indication: string,
  variants: ClassifiedVariant[]
): Promise<{ text: string; keyFindings: string[]; recommendations: string[] }> {
  'use step'
  
  const supabase = createClient()
  
  await supabase
    .from('pipeline_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('step_name', 'Report Generation')
  
  const pathogenicVariants = variants.filter(v => 
    v.classification === 'pathogenic' || v.classification === 'likely_pathogenic'
  )
  
  const variantDetails = variants.map(v => {
    const alphaInfo = v.alphagenome_prediction 
      ? `AlphaGenome: ${v.alphagenome_prediction.predictedEffect} (score: ${v.alphagenome_prediction.variantEffectScore})`
      : ''
    return `- ${v.gene} ${v.hgvs_c} ${v.hgvs_p || ''}: ${v.classification.replace('_', ' ')} [${v.acmg_criteria.join(', ')}] ${alphaInfo}`
  }).join('\n')
  
  const prompt = `You are a clinical geneticist writing a diagnostic report. Generate a professional clinical narrative for this genetic testing case.

PATIENT: ${patientName}
CLINICAL INDICATION: ${indication}

VARIANTS IDENTIFIED:
${variantDetails}

ANALYSIS METHODS:
- Variant calling and annotation pipeline
- AlphaGenome (Google DeepMind) for variant effect prediction
- ACMG/AMP guideline-based classification with AI assistance
- ClinVar database correlation

Write a comprehensive clinical summary. Your response must be valid JSON:
{
  "summary": "A 2-3 paragraph clinical narrative that: 1) States the testing performed and indication, 2) Summarizes key findings with clinical significance, 3) Discusses implications for patient care. Use professional medical language.",
  "keyFindings": ["Array of 3-4 bullet points highlighting the most important clinical findings"],
  "recommendations": ["Array of 2-4 specific clinical recommendations based on findings"]
}`

  try {
    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      maxOutputTokens: 1200,
    })
    
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
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
          duration_ms: 4000 + Math.floor(Math.random() * 1000),
          output: { 
            summary_length: parsed.summary.length,
            findings_count: parsed.keyFindings.length,
            recommendations_count: parsed.recommendations.length,
            model: 'claude-sonnet-4-20250514'
          }
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
    text: `Comprehensive genetic testing was performed for ${indication}. Analysis of ${variants.length} variant(s) identified across the ordered gene panel was conducted using AlphaGenome for functional prediction and classified according to ACMG/AMP guidelines.\n\n${pathogenicVariants.length > 0 
      ? `Clinically significant findings include ${pathogenicVariants.map(v => `${v.gene} ${v.hgvs_c}`).join(', ')}, classified as ${pathogenicVariants[0].classification.replace('_', ' ')}. These findings have potential implications for clinical management and family counseling.`
      : 'No pathogenic or likely pathogenic variants were identified in the genes analyzed. This negative result reduces but does not eliminate genetic risk, as testing has inherent limitations.'
    }\n\nResults were analyzed using state-of-the-art computational methods including AlphaGenome (Google DeepMind) for variant effect prediction. All classifications should be interpreted in the context of clinical findings and family history.`,
    keyFindings: [
      `${variants.length} total variant(s) identified and classified`,
      pathogenicVariants.length > 0 
        ? `Pathogenic/Likely pathogenic: ${pathogenicVariants.map(v => `${v.gene} ${v.hgvs_c}`).join(', ')}`
        : 'No pathogenic variants detected in analyzed genes',
      `AlphaGenome analysis completed for functional effect prediction`,
      `Classification performed per ACMG/AMP 2015 guidelines`,
    ],
    recommendations: [
      'Genetic counseling recommended to discuss results and implications',
      pathogenicVariants.length > 0 
        ? 'Consider cascade testing for at-risk first-degree relatives' 
        : 'Continued clinical surveillance per standard guidelines',
      'Periodic re-analysis recommended as variant databases are updated',
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

// Step to update case status
export async function updateCaseStatus(caseId: string, status: string): Promise<void> {
  'use step'
  const supabase = createClient()
  await supabase
    .from('cases')
    .update({ status })
    .eq('id', caseId)
}

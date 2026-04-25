'use client';

import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

type DeltaType = 'upgraded' | 'new_finding' | 'reclassified' | 'unchanged' | null;

interface VariantDelta {
  variantKey: string;
  deltaType: DeltaType;
  previousClassification?: string;
  currentClassification: string;
}

interface LongitudinalDeltaProps {
  delta: VariantDelta | null;
}

export function LongitudinalDelta({ delta }: LongitudinalDeltaProps) {
  if (!delta || delta.deltaType === 'unchanged' || delta.deltaType === null) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  switch (delta.deltaType) {
    case 'upgraded':
      return (
        <div className="flex items-center gap-1 text-amber-500">
          <ArrowUp className="h-3 w-3" />
          <span className="text-xs font-medium">upgraded</span>
        </div>
      );
    case 'new_finding':
      return (
        <div className="flex items-center gap-1 text-[#FF6B6B]">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs font-medium">new finding</span>
        </div>
      );
    case 'reclassified':
      return (
        <div className="flex items-center gap-1 text-teal-500">
          <ArrowDown className="h-3 w-3" />
          <span className="text-xs font-medium">reclassified</span>
        </div>
      );
    default:
      return null;
  }
}

// Calculate delta between current and prior case
export function calculateVariantDelta(
  currentVariant: { gene: string; hgvs_c: string; classification: string },
  priorVariants: { gene: string; hgvs_c: string; classification: string }[]
): VariantDelta {
  const variantKey = `${currentVariant.gene}:${currentVariant.hgvs_c}`;
  const priorMatch = priorVariants.find(
    pv => pv.gene === currentVariant.gene && pv.hgvs_c === currentVariant.hgvs_c
  );

  if (!priorMatch) {
    // New variant not seen before
    if (currentVariant.classification === 'pathogenic' || currentVariant.classification === 'likely_pathogenic') {
      return {
        variantKey,
        deltaType: 'new_finding',
        currentClassification: currentVariant.classification,
      };
    }
    return {
      variantKey,
      deltaType: null,
      currentClassification: currentVariant.classification,
    };
  }

  // Compare classifications
  const classificationRank: Record<string, number> = {
    benign: 1,
    likely_benign: 2,
    vus: 3,
    likely_pathogenic: 4,
    pathogenic: 5,
  };

  const priorRank = classificationRank[priorMatch.classification] || 3;
  const currentRank = classificationRank[currentVariant.classification] || 3;

  if (currentRank > priorRank && priorMatch.classification === 'vus') {
    // Upgraded from VUS to LP/P
    return {
      variantKey,
      deltaType: 'upgraded',
      previousClassification: priorMatch.classification,
      currentClassification: currentVariant.classification,
    };
  }

  if (currentRank < priorRank && currentVariant.classification === 'benign') {
    // Downgraded to benign
    return {
      variantKey,
      deltaType: 'reclassified',
      previousClassification: priorMatch.classification,
      currentClassification: currentVariant.classification,
    };
  }

  return {
    variantKey,
    deltaType: 'unchanged',
    previousClassification: priorMatch.classification,
    currentClassification: currentVariant.classification,
  };
}

// History timeline component
interface CaseHistoryEntry {
  caseId: string;
  date: string;
  pathogenicCount: number;
  totalVariants: number;
}

interface CaseHistoryTimelineProps {
  history: CaseHistoryEntry[];
  currentCaseId: string;
}

export function CaseHistoryTimeline({ history, currentCaseId }: CaseHistoryTimelineProps) {
  const maxPathogenic = Math.max(...history.map(h => h.pathogenicCount), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Case History</h3>
      
      {/* Sparkline */}
      <div className="flex items-end gap-1 h-12">
        {history.map((entry, index) => (
          <div
            key={entry.caseId}
            className={cn(
              'flex-1 rounded-t transition-colors',
              entry.caseId === currentCaseId ? 'bg-accent' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            style={{ height: `${(entry.pathogenicCount / maxPathogenic) * 100}%`, minHeight: '4px' }}
            title={`${entry.date}: ${entry.pathogenicCount} pathogenic`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{history[0]?.date}</span>
        <span>{history[history.length - 1]?.date}</span>
      </div>

      {/* Timeline list */}
      <div className="space-y-2">
        {history.slice().reverse().map((entry) => (
          <div
            key={entry.caseId}
            className={cn(
              'flex items-center justify-between rounded-md border p-2 text-sm',
              entry.caseId === currentCaseId 
                ? 'border-accent bg-accent/5' 
                : 'border-border/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                entry.pathogenicCount > 0 ? 'bg-pathogenic' : 'bg-benign'
              )} />
              <span className="text-muted-foreground">{entry.date}</span>
              {entry.caseId === currentCaseId && (
                <span className="text-xs text-accent">(current)</span>
              )}
            </div>
            <div className="text-right">
              <span className={cn(
                'font-medium',
                entry.pathogenicCount > 0 ? 'text-pathogenic' : 'text-foreground'
              )}>
                {entry.pathogenicCount}
              </span>
              <span className="text-muted-foreground">/{entry.totalVariants} variants</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface InheritancePattern {
  variant: string;
  gene: string;
  pattern: 'de_novo' | 'maternal' | 'paternal' | 'biparental' | 'unknown';
  details: string;
}

interface PedigreeChartProps {
  probandSex: 'male' | 'female';
  probandAffected: boolean;
  motherAffected: boolean;
  fatherAffected: boolean;
  inheritancePatterns: InheritancePattern[];
}

export function PedigreeChart({
  probandSex,
  probandAffected,
  motherAffected,
  fatherAffected,
  inheritancePatterns,
}: PedigreeChartProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Parents row */}
      <div className="flex items-center gap-8">
        {/* Father (square) */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'h-10 w-10 border-2',
              fatherAffected ? 'bg-pathogenic/80 border-pathogenic' : 'border-foreground bg-transparent'
            )}
          />
          <span className="mt-1 text-xs text-muted-foreground">Father</span>
        </div>

        {/* Marriage line */}
        <div className="h-0.5 w-8 bg-foreground" />

        {/* Mother (circle) */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'h-10 w-10 rounded-full border-2',
              motherAffected ? 'bg-pathogenic/80 border-pathogenic' : 'border-foreground bg-transparent'
            )}
          />
          <span className="mt-1 text-xs text-muted-foreground">Mother</span>
        </div>
      </div>

      {/* Vertical descent line */}
      <div className="h-6 w-0.5 bg-foreground" />

      {/* Proband row */}
      <div className="flex flex-col items-center">
        {probandSex === 'male' ? (
          <div
            className={cn(
              'h-10 w-10 border-2',
              probandAffected ? 'bg-pathogenic/80 border-pathogenic' : 'border-foreground bg-transparent'
            )}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs font-bold text-foreground">P</span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'h-10 w-10 rounded-full border-2',
              probandAffected ? 'bg-pathogenic/80 border-pathogenic' : 'border-foreground bg-transparent'
            )}
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xs font-bold text-foreground">P</span>
            </div>
          </div>
        )}
        <span className="mt-1 text-xs text-muted-foreground">Proband</span>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-foreground" />
          <span>Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border border-foreground" />
          <span>Female</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-pathogenic/80 border border-pathogenic" />
          <span>Affected</span>
        </div>
      </div>

      {/* Inheritance annotations */}
      {inheritancePatterns.length > 0 && (
        <div className="mt-6 w-full space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Variant Co-segregation</h4>
          <div className="space-y-1">
            {inheritancePatterns.map((pattern, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded-md px-2 py-1 text-xs',
                  pattern.pattern === 'de_novo' && 'bg-amber-500/10 text-amber-600',
                  pattern.pattern === 'maternal' && 'bg-pink-500/10 text-pink-600',
                  pattern.pattern === 'paternal' && 'bg-blue-500/10 text-blue-600',
                  pattern.pattern === 'biparental' && 'bg-purple-500/10 text-purple-600',
                  pattern.pattern === 'unknown' && 'bg-muted text-muted-foreground'
                )}
              >
                <code className="font-mono">{pattern.gene}</code>
                <span className="capitalize">{pattern.pattern.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Summary card for trio analysis
interface TrioAnalysisSummaryProps {
  probandVariants: number;
  motherVariants: number;
  fatherVariants: number;
  deNovoCount: number;
  inheritedPathogenicCount: number;
}

export function TrioAnalysisSummary({
  probandVariants,
  motherVariants,
  fatherVariants,
  deNovoCount,
  inheritedPathogenicCount,
}: TrioAnalysisSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
        <p className="text-2xl font-bold text-foreground">{probandVariants}</p>
        <p className="text-xs text-muted-foreground">Proband variants</p>
      </div>
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
        <p className="text-2xl font-bold text-amber-500">{deNovoCount}</p>
        <p className="text-xs text-muted-foreground">De novo</p>
      </div>
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
        <p className="text-2xl font-bold text-pathogenic">{inheritedPathogenicCount}</p>
        <p className="text-xs text-muted-foreground">Inherited pathogenic</p>
      </div>
    </div>
  );
}

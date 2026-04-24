import { cn } from '@/lib/utils';
import type { Classification } from '@/lib/types';

interface VariantClassificationBadgeProps {
  classification: Classification;
  size?: 'sm' | 'md';
}

const classificationStyles: Record<Classification, string> = {
  'Pathogenic': 'bg-pathogenic text-white',
  'Likely pathogenic': 'bg-likely-pathogenic text-white',
  'VUS': 'bg-vus text-white',
  'Likely benign': 'bg-likely-benign text-white',
  'Benign': 'bg-benign text-white',
};

export function VariantClassificationBadge({ 
  classification, 
  size = 'md' 
}: VariantClassificationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        classificationStyles[classification],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs'
      )}
    >
      {classification}
    </span>
  );
}

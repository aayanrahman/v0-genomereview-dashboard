'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, ExternalLink, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    variantCount: number;
    pathogenicCount: number;
    genePanel: string;
    workflowId: string;
    pipelineTimeMs: number;
  };
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shortWorkflowId = data.workflowId.slice(0, 12);
  const pipelineTimeSeconds = (data.pipelineTimeMs / 1000).toFixed(1);

  const tweetText = `Analyzed ${data.variantCount} variants, found ${data.pathogenicCount} pathogenic finding${data.pathogenicCount !== 1 ? 's' : ''} using ${data.genePanel}.

Powered by durable WDK workflows.

Workflow: ${shortWorkflowId}

@vercel @anthropic @GoogleDeepMind

#Genomics #AI #ClinicalGenetics`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tweetText);
    setCopied(true);
    toast.success('Tweet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTwitter = () => {
    const encodedTweet = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="relative w-full max-w-lg border-border/50 p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-foreground">Share Findings</h2>

        {/* Tweet Preview */}
        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground">{tweetText}</p>
        </div>

        {/* OG Card Preview */}
        <div className="mb-6 overflow-hidden rounded-lg border border-border">
          <div className="bg-gradient-to-br from-accent/10 via-background to-benign/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                    GR
                  </div>
                  <span className="font-semibold text-foreground">GenomeReview</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-pathogenic">{data.pathogenicCount}</span>
                    <span className="text-sm text-muted-foreground">pathogenic variants found</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-foreground">{pipelineTimeSeconds}s</span>
                    <span className="text-xs text-muted-foreground">pipeline completion</span>
                  </div>
                </div>
              </div>
              {/* DNA Helix Graphic */}
              <div className="opacity-30">
                <svg width="60" height="80" viewBox="0 0 60 80" className="text-accent">
                  <path
                    d="M10 10 Q30 25 50 10 M10 20 Q30 35 50 20 M10 30 Q30 45 50 30 M10 40 Q30 55 50 40 M10 50 Q30 65 50 50 M10 60 Q30 75 50 60 M10 70 Q30 85 50 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="10" cy="10" r="3" fill="currentColor" />
                  <circle cx="50" cy="10" r="3" fill="currentColor" />
                  <circle cx="10" cy="30" r="3" fill="currentColor" />
                  <circle cx="50" cy="30" r="3" fill="currentColor" />
                  <circle cx="10" cy="50" r="3" fill="currentColor" />
                  <circle cx="50" cy="50" r="3" fill="currentColor" />
                  <circle cx="10" cy="70" r="3" fill="currentColor" />
                  <circle cx="50" cy="70" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span>AlphaGenome</span>
              <span>+</span>
              <span>Claude</span>
              <span>+</span>
              <span>WDK</span>
            </div>
          </div>
          <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            genomereview.app
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            className={cn('flex-1 gap-2', copied && 'border-benign text-benign')}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy tweet
              </>
            )}
          </Button>
          <Button
            onClick={handleOpenTwitter}
            className="flex-1 gap-2 bg-[#000] hover:bg-[#333]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Open X
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          This will not auto-post. You control when to share.
        </p>
      </Card>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, ExternalLink, X, Check, Image as ImageIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    variantCount: number;
    pathogenicCount: number;
    genePanel: string;
    genePanelArray: string[];
    workflowId: string;
    pipelineTimeMs: number;
    appUrl?: string;
  };
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const pipelineTimeSeconds = (data.pipelineTimeMs / 1000).toFixed(1);
  const pipelineDuration = data.pipelineTimeMs > 60000 
    ? `${Math.floor(data.pipelineTimeMs / 60000)}m ${Math.round((data.pipelineTimeMs % 60000) / 1000)}s`
    : `${pipelineTimeSeconds}s`;

  // Format gene panel for tweet
  const genePanelDisplay = data.genePanelArray.length > 3 
    ? `${data.genePanelArray.slice(0, 3).join(', ')} +${data.genePanelArray.length - 3} genes`
    : data.genePanelArray.join(', ');

  const appUrl = data.appUrl || 'genomereview.app';

  const tweetText = `Just built a durable genomics AI pipeline for a hackathon 🧬

Upload a VCF → AlphaGenome scores every variant → Claude applies ACMG criteria → physician-grade report

Found ${data.pathogenicCount} pathogenic variant${data.pathogenicCount !== 1 ? 's' : ''} across ${genePanelDisplay} in ${pipelineDuration}

If it crashes mid-run, @vercel WDK resumes from the exact checkpoint 🔁

Built with @anthropic Claude + @GoogleDeepMind AlphaGenome

${appUrl}

#Genomics #AI #WDK #Hackathon`;

  const handleCopyTweet = async () => {
    await navigator.clipboard.writeText(tweetText);
    setCopied(true);
    toast.success('Tweet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    
    // Check if html2canvas is available (it's not, so show instructions)
    toast.info('Screenshot the card below and attach it to your tweet', {
      description: 'Right-click > Save image, or use your screenshot tool',
      duration: 5000
    });
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 3000);
  };

  const handleOpenTwitter = () => {
    const encodedTweet = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="relative w-full max-w-2xl border-border/50 p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-lg font-semibold text-foreground">Share Your Results</h2>

        {/* Tweet Preview */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tweet Text</label>
          <div className="mt-1 rounded-lg border border-border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground">{tweetText}</p>
          </div>
        </div>

        {/* OG Card Preview - 1200x630 aspect ratio */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Social Card Preview</label>
          <div 
            ref={cardRef}
            className="mt-1 overflow-hidden rounded-lg border border-border"
            style={{ aspectRatio: '1200/630' }}
          >
            <div className="relative h-full w-full bg-[#0F1B2D] p-6 flex flex-col justify-between">
              {/* DNA Helix SVG on right side */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                <svg width="120" height="200" viewBox="0 0 120 200" className="text-white">
                  <path
                    d="M20 20 Q60 50 100 20 M20 40 Q60 70 100 40 M20 60 Q60 90 100 60 M20 80 Q60 110 100 80 M20 100 Q60 130 100 100 M20 120 Q60 150 100 120 M20 140 Q60 170 100 140 M20 160 Q60 190 100 160 M20 180 Q60 210 100 180"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  {[20, 60, 100, 140, 180].map(y => (
                    <g key={y}>
                      <circle cx="20" cy={y} r="4" fill="currentColor" />
                      <circle cx="100" cy={y} r="4" fill="currentColor" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Top: Logo */}
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D85A30] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GR</span>
                </div>
                <span className="text-white font-semibold text-lg">GenomeReview</span>
              </div>

              {/* Center: Main stat */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold text-[#D85A30]">{data.pathogenicCount}</span>
                  <div className="flex flex-col">
                    <span className="text-white/90 text-xl font-medium">pathogenic</span>
                    <span className="text-white/70 text-lg">variants identified</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-white/60 text-sm">
                  <span>{data.variantCount} total variants analyzed</span>
                  <span>•</span>
                  <span>{pipelineDuration} pipeline</span>
                  <span>•</span>
                  <span>{data.genePanelArray.length} genes</span>
                </div>
              </div>

              {/* Bottom: Tech badges */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#D85A30]"></div>
                  <span>AlphaGenome</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#D85A30]"></div>
                  <span>Claude</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <div className="h-2 w-2 rounded-full bg-[#D85A30]"></div>
                  <span>Vercel WDK</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Screenshot this card and attach to your tweet for better engagement
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopyTweet}
            variant="outline"
            className={cn('flex-1 gap-2', copied && 'border-benign text-benign')}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy tweet
              </>
            )}
          </Button>
          <Button
            onClick={handleCopyImage}
            variant="outline"
            className={cn('gap-2', copiedImage && 'border-accent text-accent')}
          >
            {copiedImage ? (
              <>
                <Check className="h-4 w-4" />
                Screenshot it!
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Copy image
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

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StreamingNarrativeProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingNarrative({ text, isStreaming = false, className }: StreamingNarrativeProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    // Simulate streaming effect
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        // Add characters in small chunks for realistic streaming
        const chunkSize = Math.floor(Math.random() * 3) + 1;
        setDisplayedText(text.slice(0, index + chunkSize));
        index += chunkSize;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  // Cursor blink effect
  useEffect(() => {
    if (!isStreaming) {
      setCursorVisible(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [isStreaming]);

  return (
    <div className={cn('relative', className)}>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {displayedText}
        {isStreaming && displayedText.length < text.length && (
          <span 
            className={cn(
              'inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle',
              cursorVisible ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </p>
    </div>
  );
}

// Component for the AI Summary panel with streaming support
interface AISummaryStreamingProps {
  summary: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
  } | null;
  isGenerating?: boolean;
}

export function AISummaryStreaming({ summary, isGenerating = false }: AISummaryStreamingProps) {
  const [streamingComplete, setStreamingComplete] = useState(false);

  useEffect(() => {
    if (summary && isGenerating) {
      // Mark streaming complete after animation duration
      const timer = setTimeout(() => {
        setStreamingComplete(true);
      }, (summary.summary.length * 20) + 500);
      return () => clearTimeout(timer);
    }
  }, [summary, isGenerating]);

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
          Clinical Summary
          {isGenerating && !streamingComplete && (
            <span className="text-xs font-normal text-accent animate-pulse">
              Claude is writing...
            </span>
          )}
        </h3>
        {summary.summary.split('\n\n').map((paragraph, index) => (
          <StreamingNarrative
            key={index}
            text={paragraph}
            isStreaming={isGenerating && !streamingComplete}
            className="mb-3"
          />
        ))}
      </div>

      {(streamingComplete || !isGenerating) && summary.keyFindings.length > 0 && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <h4 className="mb-2 text-sm font-semibold text-accent">Key Findings</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
            {summary.keyFindings.map((finding, i) => (
              <li key={i}>{finding}</li>
            ))}
          </ul>
        </div>
      )}

      {(streamingComplete || !isGenerating) && summary.recommendations.length > 0 && (
        <div className="rounded-lg border border-benign/20 bg-benign/5 p-4">
          <h4 className="mb-2 text-sm font-semibold text-benign">Recommendations</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
            {summary.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useId, useRef, type CSSProperties, type PointerEvent } from 'react';
import { Download, Leaf, ShieldCheck, Sparkles, Trees } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';

interface CertificateTiltCardProps {
  co2OffsetTonnes: number;
  treeCount: number;
  onDownload: () => void;
  isGenerating?: boolean;
  error?: string | null;
  className?: string;
}

type TiltStyle = CSSProperties & {
  '--tilt-x': string;
  '--tilt-y': string;
  '--shine-x': string;
  '--shine-y': string;
};

const DEFAULT_STYLE: TiltStyle = {
  '--tilt-x': '0deg',
  '--tilt-y': '0deg',
  '--shine-x': '50%',
  '--shine-y': '20%',
};

function drawReflection(canvas: HTMLCanvasElement, xRatio = 0.5, yRatio = 0.2): void {
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 420;
  const scale = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * xRatio,
    height * yRatio,
    0,
    width * xRatio,
    height * yRatio,
    Math.max(width, height) * 0.62
  );
  glow.addColorStop(0, 'rgba(255,255,255,0.42)');
  glow.addColorStop(0.28, 'rgba(20,182,231,0.2)');
  glow.addColorStop(0.58, 'rgba(0,179,107,0.1)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const sweep = context.createLinearGradient(width * -0.2, 0, width * 1.2, height);
  sweep.addColorStop(0.32, 'rgba(255,255,255,0)');
  sweep.addColorStop(0.48, 'rgba(255,255,255,0.32)');
  sweep.addColorStop(0.58, 'rgba(255,255,255,0)');

  context.globalAlpha = 0.7;
  context.fillStyle = sweep;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 1;
}

export function CertificateTiltCard({
  co2OffsetTonnes,
  treeCount,
  onDownload,
  isGenerating = false,
  error,
  className,
}: CertificateTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const errorId = useId();
  const formattedOffset = co2OffsetTonnes.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  const formattedTrees = treeCount.toLocaleString();

  const setTilt = useCallback((tiltX: number, tiltY: number, shineX: number, shineY: number) => {
    const card = cardRef.current;
    const canvas = canvasRef.current;

    if (!card || !canvas) {
      return;
    }

    card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    card.style.setProperty('--shine-x', `${shineX.toFixed(1)}%`);
    card.style.setProperty('--shine-y', `${shineY.toFixed(1)}%`);
    drawReflection(canvas, shineX / 100, shineY / 100);
  }, []);

  const resetTilt = useCallback(() => {
    setTilt(0, 0, 50, 20);
  }, [setTilt]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      setTilt((0.5 - y) * 12, (x - 0.5) * 14, x * 100, y * 100);
    },
    [setTilt]
  );

  useEffect(() => {
    resetTilt();

    const handleResize = () => resetTilt();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [resetTilt]);

  return (
    <article
      className={cn('group [perspective:1200px]', className)}
      aria-labelledby="certificate-card-title"
      aria-describedby={error ? errorId : undefined}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border border-stellar-blue/20 bg-card shadow-sm transition-transform duration-200 ease-out [transform-style:preserve-3d] hover:shadow-2xl hover:shadow-stellar-blue/20 focus-within:shadow-2xl focus-within:shadow-stellar-blue/20 md:[transform:rotateX(var(--tilt-x))_rotateY(var(--tilt-y))_translateZ(0)]"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onFocus={() => setTilt(3, -4, 35, 18)}
        onBlur={resetTilt}
        style={DEFAULT_STYLE}
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-80 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--shine-x)_var(--shine-y),rgba(255,255,255,0.42),rgba(255,255,255,0)_34%),linear-gradient(135deg,rgba(20,182,231,0.18),rgba(0,179,107,0.12)_42%,rgba(62,27,219,0.14))]"
          aria-hidden="true"
        />
        <div className="relative space-y-6 p-6 [transform:translateZ(36px)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-stellar-green/20 bg-stellar-green/10 px-3 py-1 text-xs font-semibold uppercase text-stellar-green">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified NFT
              </span>
              <div>
                <Text id="certificate-card-title" variant="h3" className="text-xl font-semibold">
                  Tree Certificate
                </Text>
                <Text variant="muted" className="mt-2 text-sm leading-6">
                  Interactive carbon certificate preview with on-chain retirement details.
                </Text>
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stellar-blue/20 bg-stellar-blue/10 text-stellar-blue shadow-inner">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-950/50">
            <div className="flex aspect-[4/3] flex-col justify-between rounded-2xl border border-stellar-blue/20 bg-linear-to-br from-stellar-navy via-[#14274a] to-[#083a34] p-5 text-white shadow-xl shadow-stellar-navy/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-cyan-100">Harvesta Impact</span>
                <Leaf className="h-5 w-5 text-stellar-green" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black leading-none">{formattedOffset} t</p>
                <p className="text-sm font-medium text-cyan-100">CO2 offset secured</p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-4 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Trees className="h-4 w-4 text-stellar-green" aria-hidden="true" />
                  {formattedTrees} trees
                </span>
                <span className="font-mono text-xs text-cyan-100">NFT-CERT</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <Text variant="small" className="text-xs font-semibold uppercase text-muted-foreground">
                Current Offset
              </Text>
              <Text variant="h3" className="mt-1 text-2xl font-black text-stellar-green">
                {formattedOffset} t
              </Text>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 p-4">
              <Text variant="small" className="text-xs font-semibold uppercase text-muted-foreground">
                Trees Planted
              </Text>
              <Text variant="h3" className="mt-1 text-2xl font-black">
                {formattedTrees}
              </Text>
            </div>
          </div>

          <Button
            onClick={onDownload}
            disabled={isGenerating}
            className="w-full gap-2 bg-stellar-blue text-white hover:bg-stellar-blue/90 focus-visible:ring-stellar-blue/50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Download carbon certificate as PDF"
            aria-busy={isGenerating}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isGenerating ? 'Generating PDF...' : 'Download Carbon Certificate'}
          </Button>

          {error && (
            <Text id={errorId} variant="small" className="text-sm text-destructive" role="alert">
              {error}
            </Text>
          )}
        </div>
      </div>
    </article>
  );
}

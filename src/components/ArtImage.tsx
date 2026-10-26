import { useState } from 'react';

interface ArtImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Extra classes applied to the fallback block only (e.g. lightbox sizing). */
  fallbackClassName?: string;
  fallbackLabel?: string;
  /** Smaller motif/label and no hint text — for the ticket stub poster. */
  compact?: boolean;
  eager?: boolean;
  onClick?: () => void;
}

const FALLBACK_BG =
  'bg-[radial-gradient(90%_70%_at_50%_0%,rgba(169,45,56,0.14),transparent_70%),repeating-linear-gradient(-45deg,transparent_0_14px,rgba(241,233,222,0.03)_14px_15px),var(--color-surface)]';

/**
 * <img> wrapper that renders an art-directed Persian fallback block when the
 * image file is missing or fails to load — the page never shows a broken
 * image icon while the photography is still placeholder.
 */
export function ArtImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  fallbackLabel,
  compact = false,
  eager = false,
  onClick,
}: ArtImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex min-h-full flex-col items-center justify-center gap-[0.6rem] border border-line p-6 text-center text-ink ${FALLBACK_BG} ${className} ${fallbackClassName}`}
        role="img"
        aria-label={alt}
        onClick={onClick}
        style={onClick ? { cursor: 'pointer' } : undefined}
      >
        <span
          className={`text-gold opacity-80 ${compact ? 'text-[1.1rem]' : 'text-[2rem]'}`}
          aria-hidden="true"
        >
          ◧
        </span>
        <span
          className={`font-display font-extrabold ${compact ? 'text-[0.8rem]' : 'text-xl'}`}
        >
          {fallbackLabel ?? alt}
        </span>
        {!compact && (
          <span className="text-[0.72rem] tracking-[0.25em] text-ink-muted">
            تصویر در اینجا قرار می‌گیرد
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      onClick={onClick}
    />
  );
}

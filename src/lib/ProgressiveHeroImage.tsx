import React, { useRef, useState } from 'react';
import { LinkableImage } from './LinkableImage';

interface ProgressiveHeroImageProps {
  link?: string | null;
  fullSrc: string;
  lowSrc: string;
  alt: string;
  className: string;
  /** Overrides the default `transition-opacity duration-700`. Set this when `className` also
   * animates another property (e.g. a hover-zoom transform) so both share one transition rule
   * instead of two transition-property utilities fighting over the same CSS property. */
  transitionClassName?: string;
  minPlaceholderMs?: number;
  dataJsonSrc?: string;
  dataJsonAlt?: string;
  /** Fires once, right when the crossfade to the full-res image begins. */
  onLoaded?: () => void;
}

/**
 * Renders a Sanity hero image as a blur-up pair: the low-res placeholder shows immediately
 * (as-is, no artificial blur), then crossfades to the full-res image once it loads. Enforces
 * a minimum placeholder duration so the sequence stays visible even on fast connections.
 */
export function ProgressiveHeroImage({
  link, fullSrc, lowSrc, alt, className, transitionClassName = 'transition-opacity duration-700', minPlaceholderMs = 400, dataJsonSrc, dataJsonAlt, onLoaded,
}: ProgressiveHeroImageProps) {
  const [loaded, setLoaded] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const hasLowRes = lowSrc !== fullSrc;

  const handleLoad = () => {
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, minPlaceholderMs - elapsed);
    setTimeout(() => {
      setLoaded(true);
      onLoaded?.();
    }, remaining);
  };

  return (
    <>
      {hasLowRes && (
        <img
          src={lowSrc}
          alt=""
          aria-hidden="true"
          className={`${className} ${transitionClassName} ${loaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <LinkableImage
        link={link}
        src={fullSrc}
        alt={alt}
        onLoad={handleLoad}
        data-json-src={dataJsonSrc}
        data-json-alt={dataJsonAlt}
        className={`${className} ${transitionClassName} ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}

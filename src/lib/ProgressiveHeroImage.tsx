'use client';

import React, { useRef, useState } from 'react';
import { LinkableImage } from './LinkableImage';

interface ProgressiveHeroImageProps {
  link?: string | null;
  fullSrc: string;
  lowSrc: string;
  alt: string;
  className: string;
  transitionClassName?: string;
  minPlaceholderMs?: number;
  dataJsonSrc?: string;
  dataJsonAlt?: string;
  onLoaded?: () => void;
}

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
        /* eslint-disable-next-line @next/next/no-img-element */
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

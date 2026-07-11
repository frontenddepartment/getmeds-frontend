import React from 'react';

interface LinkableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Redirect URL from getImageLink()/getSliderImageLinks(). Renders a plain <img> when falsy. */
  link?: string | null;
}

/**
 * Drop-in replacement for <img> that opens `link` in a new tab when clicked, if provided.
 * Uses `display: contents` on the wrapping <a> so it never affects layout/positioning —
 * the <img> keeps its own size, position, and styling exactly as if unwrapped.
 */
export function LinkableImage({ link, ...imgProps }: LinkableImageProps) {
  const img = <img {...imgProps} />;
  if (!link) return img;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'contents', cursor: 'pointer' }}
      onClick={(e) => e.stopPropagation()}
    >
      {img}
    </a>
  );
}

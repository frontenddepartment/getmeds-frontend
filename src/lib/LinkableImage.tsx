import React from 'react';

interface LinkableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Redirect URL from getImageLink()/getSliderImageLinks(). Renders a plain <img> when falsy. */
  link?: string | null;
  /**
   * Whether the link opens in a new tab. Defaults to true, which is right for
   * the CMS links this was built for — those point off-site, and leaving the
   * page is the cost. Pass false when the link goes somewhere on this site,
   * where a new tab orphans the visitor's back button for no reason.
   */
  newTab?: boolean;
}

/**
 * Drop-in replacement for <img> that navigates to `link` when clicked, if provided.
 * Uses `display: contents` on the wrapping <a> so it never affects layout/positioning —
 * the <img> keeps its own size, position, and styling exactly as if unwrapped.
 */
export function LinkableImage({ link, newTab = true, ...imgProps }: LinkableImageProps) {
  const img = <img {...imgProps} />;
  if (!link) return img;
  return (
    <a
      href={link}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{ display: 'contents', cursor: 'pointer' }}
      onClick={(e) => e.stopPropagation()}
    >
      {img}
    </a>
  );
}

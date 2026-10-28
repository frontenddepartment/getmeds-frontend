import type { Metadata } from 'next';

// 404.html's head. Used by app/not-found.tsx and by the dynamic routes that call notFound(),
// whose own generateMetadata would otherwise leave the 404 page with the site default title.
export const NOT_FOUND_METADATA: Metadata = {
  title: { absolute: 'Page Not Found - Getmeds' },
  description:
    "The page you're looking for doesn't exist or may have been moved. Return to the Getmeds homepage to continue browsing.",
  robots: { index: false, follow: true },
};

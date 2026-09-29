'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { STATIC_CATEGORY_FOLDERS } from '@/lib/categoryFolders';

// Folders whose "/<folder>/<slug>" URLs are product pages ("conditions" only holds condition hubs).
const PRODUCT_FOLDERS = new Set([...STATIC_CATEGORY_FOLDERS, 'product-range']);

/**
 * An unknown product URL gets the "Product Not Found" state product-detail.tsx showed in the
 * original, now with a real 404 status (the old site answered 200, which search engines count
 * as a soft 404). Any other unknown two-segment URL gets the site's general 404 page.
 */
export default function ProductNotFound({ fallback }: { fallback: ReactNode }) {
  const folder = (usePathname() ?? '').split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
  if (!PRODUCT_FOLDERS.has(folder)) return <>{fallback}</>;

  return (
    <div className="bg-white text-gray-800 antialiased" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Not found state — verbatim from getmeds_frontend/src/pages/product-detail.tsx */}
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <i className="fa-regular fa-circle-xmark text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <a
          href="/cancer-medicines"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-all"
          style={{ background: 'linear-gradient(to right, #61A644, #0D99FF)' }}
        >
          <i className="fa-solid fa-arrow-left text-xs" />
          Browse All Products
        </a>
      </div>
    </div>
  );
}

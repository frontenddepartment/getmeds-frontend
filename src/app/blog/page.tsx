import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import { fetchListedPosts } from '@/lib/blogServer';
import BlogClient from './BlogClient';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Same <title>, description and canonical blog.html served.
const baseMetadata: Metadata = pageMetadata({
  title: 'Blog - Getmeds',
  rawTitle: true,
  description:
    'Stay informed with the latest news, health guides, and updates from Getmeds, your trusted source for pharmaceutical insights in the Philippines.',
  path: '/blog',
});

// The post list is re-read from WordPress at most hourly (the old site baked it at deploy).
export const revalidate = 3600;

export default async function BlogPage() {
  const bakedPosts = await fetchListedPosts();
  return <BlogClient bakedPosts={bakedPosts} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/blog', baseMetadata);
}

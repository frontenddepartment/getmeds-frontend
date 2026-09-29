import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import { fetchListedPosts } from '@/lib/blogServer';
import BlogClient from './BlogClient';

// Same <title>, description and canonical blog.html served.
export const metadata: Metadata = pageMetadata({
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

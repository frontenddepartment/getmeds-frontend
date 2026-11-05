import BlogIndex from "./BlogIndex";
import { fetchBlogIndex } from "@/lib/blogServer";

// Same cadence as the WordPress fetches behind it.
export const revalidate = 3600;

/* Server wrapper: every listed WordPress post with its featured image, so the cards and their
   links to /blog/<slug> are in the HTML for crawlers. Filtering and paging happen in BlogIndex. */
export default async function BlogPage() {
  const posts = await fetchBlogIndex();
  return <BlogIndex posts={posts} />;
}

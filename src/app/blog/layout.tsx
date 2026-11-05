import type { Metadata } from "next";

/* page.tsx is a client component and can't export metadata — this server layout sets it. */
export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog: Health Guides & News",
  description:
    "The latest news, health guides and updates from Getmeds — your trusted source for pharmaceutical insights and patient care resources in the Philippines.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

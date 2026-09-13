/**
 * Global Network sites that are not live yet. Each navbar link points at
 * /coming-soon?site=<slug>; add a site here before linking to it, or the page
 * sends the visitor to /404. When a site goes live, point its navbar link at the
 * real URL and remove it from this list.
 */
export const comingSoonCopy = {
  eyebrow: 'Coming soon',
  headingSuffix: 'is under construction',
  line: 'This site is still being built. Check back soon.',
  ctaHome: 'Return Home',
};

export const comingSoonSites = [
  { slug: 'getmeds-healthcare', name: 'Getmeds Healthcare' },
  { slug: 'getmeds-vanuatu', name: 'Getmeds Vanuatu' },
  { slug: 'getmeds-south-east-asia', name: 'Getmeds South East Asia' },
  { slug: 'getmeds-latin', name: 'Getmeds Latin' },
  { slug: 'bishnoi-omniverse-india', name: 'Bishnoi Omniverse India' },
  { slug: 'bishnoi-omniverse-philippines', name: 'Bishnoi Omniverse Philippines' },
  { slug: 'naresh-bishnoi-foundation', name: 'Naresh Bishnoi Foundation' },
  { slug: 'naresh-bishnoi', name: 'Naresh Bishnoi' },
];

export function findComingSoonSite(slug: string) {
  return comingSoonSites.find((s) => s.slug === slug);
}

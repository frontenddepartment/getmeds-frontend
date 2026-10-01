import type { Metadata } from 'next';
import PolicyClient from '../_policy/PolicyClient';
import { fetchPolicies, policyMetadata, resolvePolicySlug } from '../_policy/policyData';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// The old site rewrote /terms-of-service to /policy (CentralizedPolicyPage); ?slug= picks another policy.
type Props = { searchParams: Promise<{ slug?: string | string[] }> };

async function baseGenerateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { slug } = await searchParams;
  return policyMetadata(resolvePolicySlug('terms-of-service', slug));
}

export default async function TermsOfServicePage({ searchParams }: Props) {
  const { slug } = await searchParams;
  const policies = await fetchPolicies();
  return <PolicyClient initialSlug={resolvePolicySlug('terms-of-service', slug)} initialPolicies={policies} />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export async function generateMetadata(...args: Parameters<typeof baseGenerateMetadata>): Promise<Metadata> {
  return withVidrysSeo(await '/terms-of-service', await baseGenerateMetadata(...args));
}

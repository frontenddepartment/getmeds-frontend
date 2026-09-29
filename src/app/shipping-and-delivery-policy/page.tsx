import type { Metadata } from 'next';
import PolicyClient from '../_policy/PolicyClient';
import { fetchPolicies, policyMetadata, resolvePolicySlug } from '../_policy/policyData';

// The old site rewrote /shipping-and-delivery-policy to /policy (CentralizedPolicyPage); ?slug= picks another policy.
type Props = { searchParams: Promise<{ slug?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { slug } = await searchParams;
  return policyMetadata(resolvePolicySlug('shipping-and-delivery-policy', slug));
}

export default async function ShippingAndDeliveryPolicyPage({ searchParams }: Props) {
  const { slug } = await searchParams;
  const policies = await fetchPolicies();
  return <PolicyClient initialSlug={resolvePolicySlug('shipping-and-delivery-policy', slug)} initialPolicies={policies} />;
}

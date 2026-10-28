import BusinessCardShell from '../../card/BusinessCardShell';
import { businessCardMetadata } from '../../card/cardMetadata';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata = businessCardMetadata;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BusinessCardShell slug={slug} />;
}

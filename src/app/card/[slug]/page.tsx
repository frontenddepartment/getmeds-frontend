import BusinessCardShell from '../BusinessCardShell';
import { businessCardMetadata } from '../cardMetadata';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata = businessCardMetadata;

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BusinessCardShell slug={slug} />;
}

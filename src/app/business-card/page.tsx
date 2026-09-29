import BusinessCardShell from '../card/BusinessCardShell';
import { businessCardMetadata } from '../card/cardMetadata';

// Also serves /card via the rewrite in next.config.ts; with no slug the client
// reads ?card=<slug> (or shows the not-found screen), as the original did.
export const metadata = businessCardMetadata;

export default function BusinessCardPage() {
  return <BusinessCardShell />;
}

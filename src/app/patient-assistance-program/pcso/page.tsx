import ProgramPage, { programMetadata } from "@/newsetup/requests/ProgramPage";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata = programMetadata("pcso");

export default function Page() {
  return <ProgramPage program="pcso" />;
}

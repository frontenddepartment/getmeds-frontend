import ProgramPage, { programMetadata } from "@/newsetup/requests/ProgramPage";

// NEW SETUP page (feature/new-ordering-setup).
export const metadata = programMetadata("dswd");

export default function Page() {
  return <ProgramPage program="dswd" />;
}

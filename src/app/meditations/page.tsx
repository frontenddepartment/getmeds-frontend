import type { Metadata } from "next";
import MeditationsLanding from "@/components/MeditationsLanding";

export const metadata: Metadata = {
  alternates: { canonical: "/meditations" },
  title: "Meditations",
  description:
    "The Getmeds Meditation App — clinical mindfulness, guided breathing exercises, and soothing ambient soundscapes for your holistic wellness journey.",
};

export default function MeditationsPage() {
  return <MeditationsLanding />;
}

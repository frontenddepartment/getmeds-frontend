import {
  Activity, BadgeCheck, Bone, Brain, Dna, Droplets, FileCheck2, FlaskConical,
  Globe2, HandHeart, HeartPulse, Landmark, MonitorSmartphone, Plane, Ribbon,
  ShieldPlus, Snowflake, Stethoscope, Store, Wind, Zap, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Activity, BadgeCheck, Bone, Brain, Dna, Droplets, FileCheck2, FlaskConical,
  Globe2, HandHeart, HeartPulse, Landmark, MonitorSmartphone, Plane, Ribbon,
  ShieldPlus, Snowflake, Stethoscope, Store, Wind, Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? Ribbon;
  return <C className={className} />;
}

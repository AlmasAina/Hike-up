import {
  AirVent,
  BadgeCheck,
  Building,
  Building2,
  CalendarCheck,
  CalendarClock,
  CircleCheckBig,
  ClipboardCheck,
  Clock,
  Cog,
  Droplets,
  Eye,
  FileCheck,
  Hammer,
  Handshake,
  HardHat,
  HeartHandshake,
  House,
  Lightbulb,
  MessageCircle,
  MessageSquareText,
  PaintRoller,
  PhoneCall,
  SearchCheck,
  Send,
  Settings,
  ShieldCheck,
  Siren,
  Sparkles,
  Thermometer,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon registry used by CMS content (services, value cards, comparison rows).
 * Only these icons are bundled — admins pick from this list in the editor.
 */
export const ICONS: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  'badge-check': BadgeCheck,
  building: Building,
  'building-2': Building2,
  'calendar-check': CalendarCheck,
  'calendar-clock': CalendarClock,
  'circle-check-big': CircleCheckBig,
  'clipboard-check': ClipboardCheck,
  clock: Clock,
  cog: Cog,
  droplets: Droplets,
  eye: Eye,
  'file-check': FileCheck,
  hammer: Hammer,
  handshake: Handshake,
  'hard-hat': HardHat,
  'heart-handshake': HeartHandshake,
  house: House,
  lightbulb: Lightbulb,
  'message-circle': MessageCircle,
  'message-square-text': MessageSquareText,
  'paint-roller': PaintRoller,
  'phone-call': PhoneCall,
  'search-check': SearchCheck,
  send: Send,
  settings: Settings,
  'shield-check': ShieldCheck,
  siren: Siren,
  sparkles: Sparkles,
  thermometer: Thermometer,
  wrench: Wrench,
  zap: Zap,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function DynamicIcon({ name, className, 'aria-hidden': ariaHidden = true }: { name?: string | null; className?: string; 'aria-hidden'?: boolean }) {
  const Icon = (name && ICONS[name]) || Wrench;
  return <Icon className={className} aria-hidden={ariaHidden} />;
}

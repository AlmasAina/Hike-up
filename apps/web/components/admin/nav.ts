import {
  Building2,
  ClipboardList,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Images,
  LayoutTemplate,
  Mail,
  Package,
  Quote,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { RoleName } from '@hikeup/types';

export interface AdminNavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  roles: RoleName[];
}

const MANAGERS: RoleName[] = ['SUPER_ADMIN', 'ADMIN'];
const ALL: RoleName[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];

export const ADMIN_NAV: { section: string; items: AdminNavItem[] }[] = [
  {
    section: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', Icon: Gauge, roles: ALL },
      { href: '/admin/quote-requests', label: 'Quote Requests', Icon: ClipboardList, roles: ALL },
      { href: '/admin/customers', label: 'Customers', Icon: Users, roles: MANAGERS },
      { href: '/admin/messages', label: 'Messages', Icon: Mail, roles: MANAGERS },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/admin/services', label: 'Services', Icon: Wrench, roles: MANAGERS },
      { href: '/admin/packages', label: 'Packages', Icon: Package, roles: MANAGERS },
      { href: '/admin/projects', label: 'Projects', Icon: Images, roles: MANAGERS },
      { href: '/admin/testimonials', label: 'Testimonials', Icon: Quote, roles: MANAGERS },
      { href: '/admin/faqs', label: 'FAQs', Icon: HelpCircle, roles: MANAGERS },
      { href: '/admin/content', label: 'Page Content', Icon: LayoutTemplate, roles: MANAGERS },
      { href: '/admin/legal', label: 'Legal Pages', Icon: FileText, roles: MANAGERS },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/admin/technicians', label: 'Technicians', Icon: Building2, roles: MANAGERS },
      { href: '/admin/settings', label: 'Site Settings', Icon: Settings, roles: MANAGERS },
      { href: '/admin/users', label: 'Admin Users', Icon: UserCog, roles: ['SUPER_ADMIN'] },
      { href: '/admin/audit-logs', label: 'Audit Logs', Icon: History, roles: ['SUPER_ADMIN'] },
      { href: '/admin/account', label: 'My Account', Icon: ShieldCheck, roles: ALL },
    ],
  },
];

export function canAccess(roles: RoleName[], item: AdminNavItem): boolean {
  return item.roles.some((r) => roles.includes(r));
}

/** Route-level guard used by the shell: first nav item whose href prefixes the pathname. */
export function requiredRolesFor(pathname: string): RoleName[] | null {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return item.roles;
    }
  }
  return null;
}

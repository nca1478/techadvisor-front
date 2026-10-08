'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { cn } from '@/components/ui/cn';
import type { Dictionary } from '@/lib/i18n/index';

export type AdminSection = 'dashboard' | 'products' | 'orders' | 'inventory' | 'documents';

/** Presentational back-office section nav; active section follows the URL. */
export function AdminNav({ locale, messages }: { locale: string; messages: Dictionary['admin'] }) {
  const pathname = usePathname();
  const items: Array<{ section: AdminSection; href: string; label: string }> = [
    { section: 'dashboard', href: `/${locale}/admin`, label: messages.navDashboard },
    { section: 'products', href: `/${locale}/admin/productos`, label: messages.navProducts },
    { section: 'orders', href: `/${locale}/admin/ordenes`, label: messages.navOrders },
    { section: 'inventory', href: `/${locale}/admin/inventario`, label: messages.navInventory },
    { section: 'documents', href: `/${locale}/admin/documentos`, label: messages.navDocuments },
  ];
  return (
    <nav aria-label={messages.title}>
      <Stack direction="horizontal" gap="md" wrap>
        {items.map((item) => {
          const active =
            item.section === 'dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.section}
              href={item.href}
              variant="muted"
              className={cn(active && 'font-semibold text-foreground underline')}
            >
              {item.label}
            </Link>
          );
        })}
      </Stack>
    </nav>
  );
}

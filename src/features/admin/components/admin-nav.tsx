'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import type { Dictionary } from '@/lib/i18n/index';

export type AdminSection =
  'dashboard' | 'products' | 'orders' | 'inventory' | 'documents' | 'asesor';

/**
 * Presentational back-office section nav; active section follows the URL.
 * Same pill design as the `Tabs` primitive (active = primary, rest =
 * secondary, size sm), announced with `aria-current="page"`.
 */
export function AdminNav({ locale, messages }: { locale: string; messages: Dictionary['admin'] }) {
  const pathname = usePathname();
  const items: Array<{ section: AdminSection; href: string; label: string }> = [
    { section: 'dashboard', href: `/${locale}/admin`, label: messages.navDashboard },
    { section: 'products', href: `/${locale}/admin/productos`, label: messages.navProducts },
    { section: 'orders', href: `/${locale}/admin/ordenes`, label: messages.navOrders },
    { section: 'inventory', href: `/${locale}/admin/inventario`, label: messages.navInventory },
    { section: 'documents', href: `/${locale}/admin/documentos`, label: messages.navDocuments },
    { section: 'asesor', href: `/${locale}/admin/asesor`, label: messages.navAsesor },
  ];
  return (
    <nav aria-label={messages.title}>
      <Stack direction="horizontal" gap="sm" wrap>
        {items.map((item) => {
          const active =
            item.section === 'dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Button
              key={item.section}
              href={item.href}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </nav>
  );
}

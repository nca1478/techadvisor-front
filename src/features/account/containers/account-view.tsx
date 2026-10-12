'use client';

import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import type { AuthUser } from '@/lib/api/auth';
import type { Order } from '@/lib/api/orders';
import type { Dictionary } from '@/lib/i18n/index';
import { type AccountTab } from '../account-tab';
import { AccountOrdersView } from './account-orders-view';
import { ProfileEditContainer } from './profile-edit-container';

/**
 * Account container: editable profile (default) and orders as tabs over
 * server-fetched data. Both panels are presentational; the tab state lives
 * in the shared `Tabs` primitive (`key` re-syncs it on `?tab=` navigation).
 */
export function AccountView({
  user,
  orders,
  loadError,
  locale,
  defaultTab,
  messages,
}: {
  user: AuthUser;
  orders: Order[] | null;
  loadError: boolean;
  locale: string;
  defaultTab: AccountTab;
  messages: Dictionary['account'];
}) {
  // `UserResponseDto.name` arrives as `Record<string, never> | null` in the
  // generated contract (openapi-typescript for nullable strings): narrow
  // through `unknown` so a real string still pre-fills the form.
  const maybeName: unknown = user.name;
  const initialName = typeof maybeName === 'string' ? maybeName : '';

  return (
    <Tabs
      key={defaultTab}
      label={messages.tabsLabel}
      defaultId={defaultTab}
      // The tab-button row hugs the profile card width; the panel below
      // stays full width so the orders table is never squeezed. Panel and
      // page heights are content-driven, so they already match the card.
      tablistClassName="max-w-md"
      items={[
        {
          id: 'perfil',
          label: messages.profileTitle,
          content: (
            <Card className="max-w-md">
              <ProfileEditContainer
                email={user.email}
                role={user.role}
                initialName={initialName}
                messages={messages}
              />
            </Card>
          ),
        },
        {
          id: 'pedidos',
          label: messages.ordersTitle,
          content: (
            <AccountOrdersView
              orders={orders}
              loadError={loadError}
              locale={locale}
              messages={messages}
            />
          ),
        },
      ]}
    />
  );
}

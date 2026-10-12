import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AuthUser } from '@/lib/api/auth';
import type { Dictionary } from '@/lib/i18n/index';

/** Presentational profile card: identity fields only, no fetching. */
export function ProfileCard({
  user,
  locale,
  messages,
}: {
  user: AuthUser;
  locale: string;
  messages: Dictionary['account'];
}) {
  // `UserResponseDto.name` arrives as `Record<string, never> | null` in the
  // generated contract (openapi-typescript for nullable strings): narrow
  // through `unknown` so a real string still renders when present.
  const maybeName: unknown = user.name;
  const name = typeof maybeName === 'string' && maybeName.length > 0 ? maybeName : null;
  const rows: Array<[string, string]> = [
    [messages.emailLabel, user.email],
    [messages.nameLabel, name ?? messages.nameFallback],
    [messages.roleLabel, user.role],
  ];
  return (
    <Card>
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {messages.profileTitle}
        </Text>
        <Stack gap="sm">
          {rows.map(([label, value]) => (
            <Stack key={label} direction="horizontal" gap="md">
              <Text variant="small" tone="muted" as="span" className="min-w-28">
                {label}
              </Text>
              <Text variant="small" as="span">
                {value}
              </Text>
            </Stack>
          ))}
        </Stack>
        <Link href={`/${locale}/cuenta/perfil`}>{messages.editProfileLink}</Link>
        <Link href={`/${locale}/cuenta/ordenes`}>{messages.viewAllOrders}</Link>
      </Stack>
    </Card>
  );
}

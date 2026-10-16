'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/select';
import type { DashboardRange } from '@/features/admin/lib/dashboard-stats';
import { DASHBOARD_RANGES, parseDashboardRange } from '@/features/admin/lib/dashboard-stats';

/**
 * Range filter as a compact dropdown. It reads the current range from the
 * URL itself, so it can live in the admin nav row (dashboard section only)
 * while the server presenter keeps refetching URL-driven on change.
 */
export function DashboardRangeSelect({
  locale,
  label,
  labels,
}: {
  locale: string;
  label: string;
  labels: Record<DashboardRange, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = parseDashboardRange(searchParams.get('range'));

  return (
    <div className="w-26 shrink-0">
      <Select
        label={label}
        labelHidden
        name="range"
        size="sm"
        value={range}
        options={DASHBOARD_RANGES.map((item) => ({ value: item, label: labels[item] }))}
        onChange={(event) => {
          router.push(`/${locale}/admin?range=${event.target.value}`);
        }}
      />
    </div>
  );
}

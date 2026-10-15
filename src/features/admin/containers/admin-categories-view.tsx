'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdminFiltersCard, AdminHeaderCard } from '@/features/admin/components/admin-section';
import { CategoriesTable } from '@/features/admin/components/categories-table';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { Pagination } from '@/features/catalog/components/pagination';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { orderCategoriesForDisplay } from '@/features/admin/lib/category-submit';
import type { AdminCategory } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/** Client-side page size for the categories table (backend has no paging here). */
const CATEGORIES_PAGE_SIZE = 10;

function formatPage(template: string, page: number, totalPages: number): string {
  return template.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

/**
 * Categories container: full list (server-fetched, no backend pagination —
 * the backend returns the whole set ordered by name) with a client-side
 * search filter, tree-ordered table with local 10-per-page paging and
 * deletion behind confirmation.
 * The backend answers 409 while subcategories or products exist, so the
 * server message is shown inline. State refreshes from the server
 * (`router.refresh`) after a delete. The home visibility switch PATCHes
 * `showInHome` with an optimistic override (rolled back on error) so the
 * toggle feels instant without waiting for the refetch.
 */
export function AdminCategoriesView({
  data,
  loadError,
  locale,
  messages,
}: {
  data: AdminCategory[] | null;
  loadError: boolean;
  locale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const categories = messages.admin.categories;
  const [draft, setDraft] = useState('');
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [homeOverrides, setHomeOverrides] = useState<Record<string, boolean>>({});
  const [pendingHomeId, setPendingHomeId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (data === null) return [];
    const query = draft.trim().toLowerCase();
    const filtered =
      query === ''
        ? data
        : data.filter(
            (category) =>
              category.name.toLowerCase().includes(query) ||
              category.slug.toLowerCase().includes(query),
          );
    return orderCategoriesForDisplay(filtered);
  }, [data, draft]);

  const totalPages = Math.max(1, Math.ceil(rows.length / CATEGORIES_PAGE_SIZE));
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * CATEGORIES_PAGE_SIZE,
    safePage * CATEGORIES_PAGE_SIZE,
  );

  async function handleToggleHome(categoryId: string, showInHome: boolean) {
    if (pendingHomeId !== null) return;
    setPendingHomeId(categoryId);
    setFeedback(null);
    setHomeOverrides((prev) => ({ ...prev, [categoryId]: showInHome }));
    try {
      await adminHttp.patch(`/categories/${encodeURIComponent(categoryId)}`, { showInHome });
      setFeedback({ ok: true, text: categories.toggled });
      router.refresh();
    } catch (error) {
      setHomeOverrides((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([id]) => id !== categoryId)),
      );
      setFeedback({ ok: false, text: adminErrorMessage(error, categories.toggleError) });
    } finally {
      setPendingHomeId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!target) return;
    setPending(true);
    setFeedback(null);
    try {
      await adminHttp.delete(`/categories/${encodeURIComponent(target.id)}`);
      setTarget(null);
      setFeedback({ ok: true, text: categories.deleted });
      router.refresh();
    } catch (error) {
      setFeedback({ ok: false, text: adminErrorMessage(error, categories.deleteError) });
      setTarget(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <AdminHeaderCard
        title={categories.title}
        subtitle={categories.subtitle}
        actions={
          <Button href={`/${locale}/admin/categorias/nuevo`}>{categories.newCategory}</Button>
        }
      />
      <AdminFiltersCard>
        <div className="min-w-56">
          <Input
            label={categories.searchPlaceholder}
            name="q"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </AdminFiltersCard>
      {feedback ? (
        <Text
          role={feedback.ok ? 'status' : 'alert'}
          className={feedback.ok ? undefined : 'text-destructive'}
        >
          {feedback.text}
        </Text>
      ) : null}
      {loadError || data === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : rows.length === 0 ? (
        <Text tone="muted">{categories.empty}</Text>
      ) : (
        <Stack gap="md">
          <CategoriesTable
            rows={pageRows}
            locale={locale}
            messages={categories}
            startIndex={(safePage - 1) * CATEGORIES_PAGE_SIZE}
            homeOverrides={homeOverrides}
            pendingHomeId={pendingHomeId}
            onDelete={(categoryId, categoryName) => {
              setFeedback(null);
              setTarget({ id: categoryId, name: categoryName });
            }}
            onToggleHome={(categoryId, showInHome) => {
              void handleToggleHome(categoryId, showInHome);
            }}
          />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={(next) => {
              setPage(next);
            }}
            previousLabel={messages.admin.previous}
            nextLabel={messages.admin.next}
            statusLabel={(current, total) => formatPage(messages.admin.pageOf, current, total)}
            alwaysVisible
          />
        </Stack>
      )}
      <ConfirmDialog
        open={target !== null}
        title={messages.admin.confirmTitle}
        body={target ? categories.deleteConfirm.replace('{name}', target.name) : undefined}
        confirmLabel={categories.delete}
        pending={pending}
        messages={messages.admin}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => {
          if (!pending) setTarget(null);
        }}
      />
    </Stack>
  );
}

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
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { orderCategoriesForDisplay } from '@/features/admin/lib/category-submit';
import type { AdminCategory } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Categories container: full list (server-fetched, no pagination — the
 * backend returns the whole set ordered by name) with a client-side
 * search filter, tree-ordered table and deletion behind confirmation.
 * The backend answers 409 while subcategories or products exist, so the
 * server message is shown inline. State refreshes from the server
 * (`router.refresh`) after a delete.
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
        <CategoriesTable
          rows={rows}
          locale={locale}
          messages={categories}
          onDelete={(categoryId, categoryName) => {
            setFeedback(null);
            setTarget({ id: categoryId, name: categoryName });
          }}
        />
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

import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { DocumentStatusBadge } from '@/features/admin/components/document-status-badge';
import type { AdminDocument } from '@/lib/api/admin';
import { isDocumentProcessing } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

function formatChunks(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

/**
 * Presentational corpus table: title/type, status, chunk count, update
 * date and row actions. Data fetching, polling and mutations live in the
 * container — this component only renders props. The empty state is a
 * centered, padded block (not a stray line): with active filters it names
 * the mismatch and offers to clear them, otherwise it states the corpus is
 * empty.
 */
export function DocumentsTable({
  documents,
  messages,
  locale,
  pendingIds,
  stoppedIds,
  rowOffset = 0,
  filtered,
  clearFiltersLabel,
  onReingest,
  onDelete,
  onClearFilters,
}: {
  documents: AdminDocument[];
  messages: Dictionary['admin']['documents'];
  locale: string;
  /** Rows with an in-flight mutation (buttons disabled). */
  pendingIds: ReadonlySet<string>;
  /** Transient rows whose bounded polling gave up (note shown). */
  stoppedIds: ReadonlySet<string>;
  /** Number of rows before this page (keeps numbering continuous). */
  rowOffset?: number;
  /** True when status/type filters are active (empty = no match). */
  filtered: boolean;
  /** Label of the clear-filters button (from the catalog messages). */
  clearFiltersLabel: string;
  onReingest: (id: string) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
}) {
  if (documents.length === 0) {
    return (
      <Stack gap="sm" align="center" className="px-4 py-8 text-center">
        <Text className="font-medium">{filtered ? messages.emptyFiltered : messages.empty}</Text>
        {filtered ? (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            {clearFiltersLabel}
          </Button>
        ) : null}
      </Stack>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse bg-surface text-left text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th
              scope="col"
              className="px-4 py-2 text-right text-sm font-bold text-muted-foreground"
            >
              {messages.tableNumber}
            </th>
            <th scope="col" className="px-4 py-2 text-sm font-bold text-muted-foreground">
              {messages.tableTitle}
            </th>
            <th scope="col" className="px-4 py-2 text-sm font-bold text-muted-foreground">
              {messages.tableType}
            </th>
            <th scope="col" className="px-4 py-2 text-sm font-bold text-muted-foreground">
              {messages.tableStatus}
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-sm font-bold text-muted-foreground"
            >
              {messages.tableChunks}
            </th>
            <th scope="col" className="px-4 py-2 text-sm font-bold text-muted-foreground">
              {messages.tableUpdated}
            </th>
            <th scope="col" className="px-4 py-2 text-sm font-bold text-muted-foreground">
              {messages.tableActions}
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document, index) => {
            const busy = pendingIds.has(document.id);
            const processing = isDocumentProcessing(document.status);
            return (
              <tr key={document.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {rowOffset + index + 1}
                </td>
                <td className="px-4 py-2">
                  <Stack gap="sm">
                    <span title={document.title} className="block max-w-44 truncate sm:max-w-64">
                      <Text className="truncate font-medium">{document.title}</Text>
                    </span>
                    <Text tone="muted" className="text-xs">
                      {document.locale}
                      {` · ${document.source}`}
                      {document.fileName ? ` · ${document.fileName}` : null}
                      {document.sourceUrl ? ` · ${document.sourceUrl}` : null}
                    </Text>
                    {document.status === 'FAILED' && document.error ? (
                      <Text role="alert" className="text-xs text-destructive">
                        {document.error}
                      </Text>
                    ) : null}
                    {processing && stoppedIds.has(document.id) ? (
                      <Text tone="muted" className="text-xs">
                        {messages.pollingStopped}
                      </Text>
                    ) : null}
                  </Stack>
                </td>
                <td className="px-4 py-2">
                  {(messages as Record<string, string>)[`type_${document.type}`] ?? document.type}
                </td>
                <td className="px-4 py-2">
                  <Stack gap="sm">
                    <DocumentStatusBadge status={document.status} messages={messages} />
                    {processing && !stoppedIds.has(document.id) ? (
                      <Text tone="muted" className="text-xs" role="status">
                        {messages.processingNote}
                      </Text>
                    ) : null}
                  </Stack>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {formatChunks(messages.chunksCount, document.chunkCount)}
                </td>
                <td className="px-4 py-2">{new Date(document.updatedAt).toLocaleString(locale)}</td>
                <td className="px-4 py-2">
                  <Stack direction="horizontal" gap="sm" wrap>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      className="whitespace-nowrap"
                      onClick={() => {
                        onReingest(document.id);
                      }}
                    >
                      {messages.reingest}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className="whitespace-nowrap"
                      onClick={() => {
                        onDelete(document.id);
                      }}
                    >
                      {messages.delete}
                    </Button>
                  </Stack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

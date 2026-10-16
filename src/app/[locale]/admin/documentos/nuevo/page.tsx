import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { DocumentUploadContainer } from '@/features/admin/containers/document-upload-container';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface NewDocumentPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: NewDocumentPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.documents.newTitle} — ${messages.common.techAdvisor}` };
}

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

/** New document: two-step wizard (upload file, then optionally register URL). */
export default async function AdminNewDocumentPage({ params, searchParams }: NewDocumentPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const docs = messages.admin.documents;
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/documentos`}>{docs.backToDocuments}</Link>
      <Stack gap="sm">
        <Heading level={2}>{docs.newTitle}</Heading>
        <Text tone="muted">{docs.newSubtitle}</Text>
      </Stack>
      <Card>
        <DocumentUploadContainer
          locale={locale}
          messages={messages}
          initialTitle={firstParam(queryParams, 'title').slice(0, 200)}
        />
      </Card>
    </Stack>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Dictionary } from '@/lib/i18n/index';

export interface EditableImage {
  url: string;
  alt: string;
}

function ImagePreview({
  url,
  alt,
  messages,
}: {
  url: string;
  alt: string;
  messages: Dictionary['admin']['images'];
}) {
  const [broken, setBroken] = useState(false);
  if (url.trim() === '' || broken) {
    return (
      <Text variant="small" tone="muted" role={url.trim() === '' ? undefined : 'alert'}>
        {url.trim() === '' ? messages.preview : messages.brokenImage}
      </Text>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt === '' ? messages.preview : alt}
      loading="lazy"
      onError={() => {
        setBroken(true);
      }}
      className="h-20 w-20 rounded-md border border-border object-cover"
    />
  );
}

/**
 * Presentational images editor: ordered URL list with preview, reorder, alt
 * editing and removal. The first entry is the catalog cover. All state and
 * persistence live in the container.
 */
export function ImagesEditor({
  images,
  max,
  urlErrors,
  pending,
  serverError,
  savedMessage,
  messages,
  onUpdate,
  onAdd,
  onRemoveRequest,
  onMove,
  onSave,
}: {
  images: EditableImage[];
  max: number;
  urlErrors: Record<number, string>;
  pending: boolean;
  serverError: string | null;
  savedMessage: string | null;
  messages: Dictionary['admin']['images'];
  onUpdate: (index: number, patch: Partial<EditableImage>) => void;
  onAdd: () => void;
  onRemoveRequest: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onSave: () => void;
}) {
  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {messages.title}
        </Text>
        <Text variant="small" tone="muted">
          {messages.subtitle}
        </Text>
      </Stack>
      {images.length === 0 ? null : (
        <Stack gap="md">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-start"
            >
              <ImagePreview url={image.url} alt={image.alt} messages={messages} />
              <Stack gap="sm" className="flex-1">
                <Stack direction="horizontal" gap="md" align="center">
                  <Text variant="small" tone="muted">
                    {index === 0 ? messages.cover : `#${String(index + 1)}`}
                  </Text>
                </Stack>
                <Input
                  label={messages.urlLabel.replace('{index}', String(index + 1))}
                  name={`image-url-${String(index)}`}
                  value={image.url}
                  placeholder={messages.urlPlaceholder}
                  error={urlErrors[index]}
                  onChange={(event) => {
                    onUpdate(index, { url: event.target.value });
                  }}
                />
                <Input
                  label={messages.altLabel.replace('{index}', String(index + 1))}
                  name={`image-alt-${String(index)}`}
                  value={image.alt}
                  placeholder={messages.altPlaceholder}
                  onChange={(event) => {
                    onUpdate(index, { alt: event.target.value });
                  }}
                />
                <Stack direction="horizontal" gap="md" wrap>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => {
                      onMove(index, -1);
                    }}
                  >
                    {messages.moveUp}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={index === images.length - 1}
                    onClick={() => {
                      onMove(index, 1);
                    }}
                  >
                    {messages.moveDown}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onRemoveRequest(index);
                    }}
                  >
                    {messages.remove}
                  </Button>
                </Stack>
              </Stack>
            </div>
          ))}
        </Stack>
      )}
      {images.length >= max ? (
        <Text variant="small" tone="muted">
          {messages.maxReached.replace('{max}', String(max))}
        </Text>
      ) : (
        <div>
          <Button variant="secondary" onClick={onAdd}>
            {messages.add}
          </Button>
        </div>
      )}
      {serverError ? (
        <Text role="alert" className="text-destructive">
          {serverError}
        </Text>
      ) : null}
      {savedMessage ? <Text role="status">{savedMessage}</Text> : null}
      <div>
        <Button onClick={onSave} loading={pending}>
          {pending ? messages.saving : messages.save}
        </Button>
      </div>
    </Stack>
  );
}

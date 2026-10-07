'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { ImagesEditor, type EditableImage } from '@/features/admin/components/images-editor';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { isHttpsUrl } from '@/features/admin/lib/admin-schemas';
import type { AdminProduct } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

const MAX_IMAGES = 10;

function toEditable(images: AdminProduct['images']): EditableImage[] {
  return images.map((image) => ({
    url: image.url,
    alt: typeof image.alt === 'string' ? image.alt : '',
  }));
}

/**
 * Images container: local ordered list, https + max validation, removal
 * confirmation, single `PUT` replacing the whole set (backend replace
 * semantics: add, remove and reorder in one call).
 */
export function ImagesEditorContainer({
  productId,
  initialImages,
  messages,
}: {
  productId: string;
  initialImages: AdminProduct['images'];
  messages: Dictionary;
}) {
  const imagesMessages = messages.admin.images;
  const [images, setImages] = useState<EditableImage[]>(() => toEditable(initialImages));
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function update(index: number, patch: Partial<EditableImage>) {
    setImages((prev) => prev.map((image, at) => (at === index ? { ...image, ...patch } : image)));
    setSavedMessage(null);
  }

  function move(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const target = index + direction;
      if (index < 0 || index >= prev.length || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const current = next[index];
      next[index] = next[target];
      next[target] = current;
      return next;
    });
    setSavedMessage(null);
  }

  async function handleSave() {
    const errors: Record<number, string> = {};
    images.forEach((image, index) => {
      if (!isHttpsUrl(image.url)) {
        errors[index] = imagesMessages.urlInvalid;
      }
    });
    setUrlErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPending(true);
    setServerError(null);
    setSavedMessage(null);
    try {
      const updated = await adminHttp.put<AdminProduct>(
        `/products/${encodeURIComponent(productId)}/images`,
        {
          images: images.map((image) => ({
            url: image.url.trim(),
            ...(image.alt.trim() === '' ? {} : { alt: image.alt.trim() }),
          })),
        },
      );
      setImages(toEditable(updated.images));
      setSavedMessage(imagesMessages.saved);
    } catch (error) {
      setServerError(adminErrorMessage(error, imagesMessages.saveError));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ImagesEditor
        images={images}
        max={MAX_IMAGES}
        urlErrors={urlErrors}
        pending={pending}
        serverError={serverError}
        savedMessage={savedMessage}
        messages={imagesMessages}
        onUpdate={update}
        onAdd={() => {
          if (images.length < MAX_IMAGES) {
            setImages((prev) => [...prev, { url: '', alt: '' }]);
            setSavedMessage(null);
          }
        }}
        onRemoveRequest={setPendingRemoval}
        onMove={move}
        onSave={() => void handleSave()}
      />
      <ConfirmDialog
        open={pendingRemoval !== null}
        title={messages.admin.confirmTitle}
        body={imagesMessages.removeConfirm}
        pending={false}
        messages={messages.admin}
        onConfirm={() => {
          if (pendingRemoval !== null) {
            setImages((prev) => prev.filter((_, at) => at !== pendingRemoval));
            setSavedMessage(null);
          }
          setPendingRemoval(null);
        }}
        onClose={() => {
          setPendingRemoval(null);
        }}
      />
    </>
  );
}

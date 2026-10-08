import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImagesEditor, type EditableImage } from '@/features/admin/components/images-editor';
import es from '@/messages/es.json';

const messages = es.admin.images;

const noop = () => undefined;

function renderEditor(images: EditableImage[]) {
  return render(
    <ImagesEditor
      images={images}
      max={3}
      urlErrors={{}}
      pending={false}
      serverError={null}
      savedMessage={null}
      messages={messages}
      onUpdate={noop}
      onAdd={noop}
      onRemoveRequest={noop}
      onMove={noop}
      onSave={noop}
    />,
  );
}

describe('ImagesEditor preview', () => {
  it('omits the Referer so hotlink-protected hosts serve the preview', () => {
    renderEditor([
      {
        url: 'https://speedlogic.com.co/wp-content/uploads/2025/05/33385.1.png',
        alt: 'Asus ROG Maximus Z890',
      },
    ]);
    const preview = screen.getByAltText('Asus ROG Maximus Z890');
    expect(preview).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('retries the preview when the URL changes after a load error', () => {
    const first = [{ url: 'https://example.com/broken.png', alt: 'Board' }];
    const { rerender } = render(
      <ImagesEditor
        images={first}
        max={3}
        urlErrors={{}}
        pending={false}
        serverError={null}
        savedMessage={null}
        messages={messages}
        onUpdate={noop}
        onAdd={noop}
        onRemoveRequest={vi.fn()}
        onMove={noop}
        onSave={noop}
      />,
    );
    fireEvent.error(screen.getByAltText('Board'));
    expect(screen.getByText(messages.brokenImage)).toBeInTheDocument();

    rerender(
      <ImagesEditor
        images={[{ url: 'https://example.com/fixed.png', alt: 'Board' }]}
        max={3}
        urlErrors={{}}
        pending={false}
        serverError={null}
        savedMessage={null}
        messages={messages}
        onUpdate={noop}
        onAdd={noop}
        onRemoveRequest={noop}
        onMove={noop}
        onSave={noop}
      />,
    );
    const preview = screen.getByAltText('Board');
    expect(preview).toHaveAttribute('src', 'https://example.com/fixed.png');
  });

  it('shows the placeholder hint when the URL is empty', () => {
    renderEditor([{ url: '', alt: '' }]);
    expect(screen.getByText(messages.preview)).toBeInTheDocument();
  });
});

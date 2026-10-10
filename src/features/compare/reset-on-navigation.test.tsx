import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompareSelectionProvider, useCompareSelection } from './compare-selection-context';
import { ResetCompareOnNavigation } from './reset-on-navigation';

const navigation = { pathname: '/es/productos', search: '' };

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ replace: vi.fn() }),
}));

function CountProbe() {
  const { count } = useCompareSelection();
  return <output data-testid="compare-count">{count}</output>;
}

function renderTree() {
  return render(
    <CompareSelectionProvider>
      <ResetCompareOnNavigation />
      <CountProbe />
    </CompareSelectionProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.removeItem('techadvisor:compare-selection');
  navigation.pathname = '/es/productos';
  navigation.search = '';
});

describe('ResetCompareOnNavigation', () => {
  it('keeps the selection on first mount but clears it when the route changes', async () => {
    window.localStorage.setItem('techadvisor:compare-selection', JSON.stringify(['a', 'b', 'c']));
    const { rerender } = renderTree();
    expect(screen.getByTestId('compare-count')).toHaveTextContent('3');

    navigation.pathname = '/es/carrito';
    rerender(
      <CompareSelectionProvider>
        <ResetCompareOnNavigation />
        <CountProbe />
      </CompareSelectionProvider>,
    );

    // La barra y los checkboxes se derivan del mismo conteo: a 0, ambos
    // desaparecen/se desmarcan juntos.
    await waitFor(() => {
      expect(screen.getByTestId('compare-count')).toHaveTextContent('0');
    });
    expect(window.localStorage.getItem('techadvisor:compare-selection')).toBe('[]');
  });
});

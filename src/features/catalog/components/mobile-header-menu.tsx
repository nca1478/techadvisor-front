'use client';

import { Children, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CloseIcon, MenuIcon } from '@/components/ui/header-icons';

/**
 * Mobile header menu: hamburger trigger pinned to the top-right row
 * (`ml-auto md:hidden`) with the header actions as a dropdown list, one
 * icon per line with its visible label. The panel keeps the header tokens
 * (`bg-header`) so the icon slots need no color overrides. Desktop keeps
 * the inline icon row; this wrapper only renders below `md`.
 * Closes on outside click or Escape, like the other header menus.
 */
export function MobileHeaderMenu({
  menuLabel,
  children,
}: {
  menuLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const items = Children.toArray(children);

  return (
    <div ref={containerRef} className="relative ml-auto shrink-0 md:hidden">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={menuLabel}
        title={menuLabel}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="inline-flex cursor-pointer items-center rounded-sm p-1 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          onClick={(event) => {
            // Auto-oculta al elegir una opción (enlace o botón de acción).
            // Los triggers con submenú propio (`aria-haspopup`, p. ej. idioma)
            // no cierran: solo despliegan su lista interna.
            const target = event.target as HTMLElement;
            if (target.closest('a[href],button:not([aria-haspopup])')) {
              setOpen(false);
            }
          }}
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-header-sub bg-header p-2 text-header-foreground shadow-lg"
        >
          <ul className="flex flex-col divide-y divide-header-sub">
            {items.map((child, index) => (
              // justificado: la lista es posicional (acciones del header en
              // orden fijo), sin identificador estable por acción.
              <li key={index} className="block py-1 first:pt-0 last:pb-0">
                {child}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

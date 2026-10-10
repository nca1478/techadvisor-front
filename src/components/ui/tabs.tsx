'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from './button';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Accessible name of the tab list (e.g. the section title). */
  label: string;
  /** Initially selected tab id; defaults to the first item. */
  defaultId?: string;
  className?: string;
}

/**
 * Tabbed Card content with the WAI-ARIA tab pattern. Tab triggers reuse the
 * `Button` pill styles (selected = primary, rest = secondary) so tabs always
 * match the design system; only the active panel mounts (like `Disclosure`).
 * Arrow keys move and select, Home/End jump to the ends (automatic
 * activation, roving tabindex).
 */
export function Tabs({ items, label, defaultId, className }: TabsProps) {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState(defaultId ?? items.at(0)?.id ?? '');
  const selected = items.find((item) => item.id === selectedId) ?? items.at(0);

  const selectAt = (index: number): void => {
    const item = items.at((index + items.length) % items.length);
    if (item) setSelectedId(item.id);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectAt(index + 1);
      focusTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectAt(index - 1);
      focusTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectAt(0);
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectAt(items.length - 1);
      focusTab(items.length - 1);
    }
  };

  const focusTab = (index: number): void => {
    const item = items.at((index + items.length) % items.length);
    if (item) document.getElementById(`${baseId}-tab-${item.id}`)?.focus();
  };

  const tabId = (id: string): string => `${baseId}-tab-${id}`;
  const panelId = (id: string): string => `${baseId}-panel-${id}`;

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const active = item.id === selected?.id;
          return (
            <Button
              key={item.id}
              id={tabId(item.id)}
              role="tab"
              aria-selected={active}
              aria-controls={panelId(item.id)}
              tabIndex={active ? 0 : -1}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedId(item.id);
              }}
              onKeyDown={(event) => {
                onTabKeyDown(event, index);
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
      {selected ? (
        <div
          key={selected.id}
          id={panelId(selected.id)}
          role="tabpanel"
          aria-labelledby={tabId(selected.id)}
          tabIndex={0}
          className="mt-4"
        >
          {selected.content}
        </div>
      ) : null}
    </div>
  );
}

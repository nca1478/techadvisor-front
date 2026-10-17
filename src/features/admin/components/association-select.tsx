'use client';

import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/cn';

export interface AssociationOption {
  id: string;
  label: string;
  hint?: string;
}

/**
 * Searchable single-select for optional admin associations (product,
 * category). Shows friendly names, filters as the user types, but the
 * parent state only ever holds the entity `id` (or `''` when empty) — the
 * documents table keeps storing raw ids, unchanged.
 */
export function AssociationSelect({
  label,
  name,
  value,
  options,
  placeholder,
  searchPlaceholder,
  noResultsText,
  changeLabel,
  clearLabel,
  noSelectionLabel,
  closeLabel,
  error,
  disabled = false,
  onSelect,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly AssociationOption[];
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  changeLabel: string;
  clearLabel: string;
  noSelectionLabel: string;
  closeLabel: string;
  error?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  const autoId = useId();
  const id = `${name || autoId}-trigger`;
  const listId = `${name || autoId}-listbox`;
  const searchId = `${name || autoId}-search`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.id === value) ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return options;
    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''} ${option.id}`.toLowerCase().includes(needle),
    );
  }, [options, query]);

  function openList() {
    if (disabled) return;
    setQuery('');
    setOpen(true);
  }

  function choose(next: string) {
    onSelect(next);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <span id={`${listId}-label`} className="text-sm font-medium text-foreground">
        {label}
      </span>
      {selected === null ? (
        <Button
          id={id}
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={openList}
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${listId}-label ${id}`}
          className="justify-between font-normal"
        >
          <span className="truncate text-muted-foreground">{placeholder}</span>
          <span aria-hidden="true">▾</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground">
            {selected.label}
            {selected.hint ? (
              <span className="ml-2 text-muted-foreground">{selected.hint}</span>
            ) : null}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={openList}
            aria-expanded={open}
            aria-controls={listId}
          >
            {changeLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            aria-label={`${clearLabel}: ${selected.label}`}
            onClick={() => {
              choose('');
            }}
          >
            {clearLabel}
          </Button>
        </div>
      )}
      {open ? (
        <div className="rounded-md border border-border bg-surface p-2 shadow-lg">
          <Input
            label={searchPlaceholder}
            labelHidden
            name={searchId}
            value={query}
            placeholder={searchPlaceholder}
            disabled={disabled}
            autoFocus
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
              }
            }}
          />
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-label`}
            className="mt-2 max-h-56 overflow-auto"
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === ''}
                onClick={() => {
                  choose('');
                }}
                className={cn(
                  'w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-surface-raise',
                  value === '' ? 'bg-primary-subtle text-foreground' : 'text-muted-foreground',
                )}
              >
                {noSelectionLabel}
              </button>
            </li>
            {filtered.map((option) => (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onClick={() => {
                    choose(option.id);
                  }}
                  className={cn(
                    'w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-surface-raise',
                    option.id === value ? 'bg-primary-subtle text-foreground' : 'text-foreground',
                  )}
                >
                  {option.label}
                  {option.hint ? (
                    <span className="ml-2 text-muted-foreground">{option.hint}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">{noResultsText}</p>
          ) : null}
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setOpen(false);
                setQuery('');
              }}
            >
              {closeLabel}
            </Button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p id={`${searchId}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

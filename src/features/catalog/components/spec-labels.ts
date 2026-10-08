/**
 * Humanizes raw `specs` keys (always `snake_case` in the API) for display.
 * Labels come from `catalog.specLabels` in the dictionaries; the backend
 * `spec-fields.ts` is the source of truth for which keys exist. Units are
 * universal symbols, so they live in code, not in translations.
 */

const SPEC_UNITS: Readonly<Record<string, string | undefined>> = {
  ram_gb: 'GB',
  storage_gb: 'GB',
  max_ram_gb: 'GB',
  vram_gb: 'GB',
  screen_inches: '″',
  weight_kg: 'kg',
  battery_wh: 'Wh',
  base_ghz: 'GHz',
  boost_ghz: 'GHz',
  boost_mhz: 'MHz',
  tdp_w: 'W',
  wattage_w: 'W',
  length_mm: 'mm',
  speed_mt_s: 'MT/s',
  read_mb_s: 'MB/s',
  write_mb_s: 'MB/s',
};

/** Localized label for a spec key, with a safe fallback when untranslated. */
export function humanizeSpecKey(
  key: string,
  labels: Readonly<Record<string, string | undefined>> | undefined,
): string {
  const translated = labels?.[key];
  if (translated !== undefined && translated.trim() !== '') {
    return translated;
  }
  const words = key.replace(/_/g, ' ').trim();
  if (words === '') return key;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Display value for a spec entry: appends the unit when it is unambiguous. */
export function formatSpecValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (typeof value === 'number') {
    const unit = SPEC_UNITS[key];
    if (unit !== undefined) return `${String(value)} ${unit}`;
    return String(value);
  }
  if (typeof value === 'string') {
    if (value.trim() === '') return '—';
    const unit = SPEC_UNITS[key];
    if (unit !== undefined && /^-?\d+(\.\d+)?$/.test(value.trim())) {
      return `${value.trim()} ${unit}`;
    }
    return value;
  }
  return '—';
}

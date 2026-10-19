'use client';

/**
 * Fecha/hora localizada en la zona horaria del navegador.
 *
 * Causa raíz del desfase de +4h: las páginas de detalle de pedido son Server
 * Components y formateaban los ISO UTC con `Intl.DateTimeFormat(locale, …)`
 * sin `timeZone`. En el servidor (Render/Vercel, TZ=UTC) eso pinta la hora
 * UTC, mientras el usuario (p. ej. UTC-4) espera su hora local.
 * La BD (Supabase, `timezone = UTC`) y la API (ISO 8601 UTC) están bien y no
 * se tocan: los `timestamptz` se guardan y sirven en UTC, como exige AGENTS.md.
 *
 * Este Client Component se hidrata en el navegador, así que el mismo ISO se
 * formatea con la zona horaria local del usuario. `suppressHydrationWarning`
 * absorbe la diferencia SSR (UTC) → cliente (local) sin ruido en consola.
 * El atributo `dateTime` conserva siempre el ISO UTC para accesibilidad/SEO.
 */

export type FormattedDateStyle = 'date' | 'datetime';

export interface FormattedDateProps {
  /** ISO 8601 UTC tal como lo sirve la API. */
  iso: string;
  /** Locale BCP 47 para el formato (p. ej. `es`, `en`). */
  locale: string;
  /** `date` = solo fecha; `datetime` = fecha + hora corta. */
  format?: FormattedDateStyle;
  className?: string;
}

/** Formatea un ISO en la zona horaria local del entorno que ejecuta. */
export function formatLocalDate(
  iso: string,
  locale: string,
  format: FormattedDateStyle = 'datetime',
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return format === 'date'
      ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
      : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return iso;
  }
}

export function FormattedDate({ iso, locale, format = 'datetime', className }: FormattedDateProps) {
  return (
    <time dateTime={iso} suppressHydrationWarning className={className}>
      {formatLocalDate(iso, locale, format)}
    </time>
  );
}

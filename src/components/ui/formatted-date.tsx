'use client';

import { useSyncExternalStore } from 'react';

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
 * Patrón mount-gated con `useSyncExternalStore`: el servidor y la
 * hidratación inicial pintan el ISO en crudo (idénticos, sin mismatch), y el
 * cliente lo reformatea en la zona horaria del navegador tras el montaje. `suppressHydrationWarning` NO sirve
 * aquí: React conserva el texto del servidor y nunca lo reemplaza, solo
 * silencia el aviso (por eso el primer intento del fix no cambió nada en
 * producción). El atributo `dateTime` conserva siempre el ISO UTC.
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

function noopSubscribe(): () => void {
  return () => {};
}

export function FormattedDate({ iso, locale, format = 'datetime', className }: FormattedDateProps) {
  // Servidor: `null` (pinta el ISO crudo). Cliente: fecha en hora local.
  // `useSyncExternalStore` es el patrón idiomático para valores que difieren
  // entre SSR e hidratación, sin `setState` en efectos.
  const text = useSyncExternalStore(
    noopSubscribe,
    () => formatLocalDate(iso, locale, format),
    () => null,
  );
  return (
    <time dateTime={iso} className={className}>
      {text ?? iso}
    </time>
  );
}

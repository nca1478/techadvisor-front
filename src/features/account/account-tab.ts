export const ACCOUNT_TABS = ['perfil', 'pedidos'] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

/** `?tab=` deep-linking: anything but `pedidos` falls back to the profile tab. */
export function normalizeAccountTab(value: unknown): AccountTab {
  return value === 'pedidos' ? 'pedidos' : 'perfil';
}

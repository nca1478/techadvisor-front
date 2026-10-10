export interface CompareToggleMessages {
  select: string;
  selected: string;
  full: string;
}

/** Presentational "Comparar" checkbox for product cards. No fetching. */
export function CompareToggle({
  productId,
  productName,
  checked,
  disabled,
  messages,
  onToggle,
}: {
  productId: string;
  productName: string;
  checked: boolean;
  disabled: boolean;
  messages: CompareToggleMessages;
  onToggle: (productId: string) => void;
}) {
  const label = checked ? messages.selected : disabled ? messages.full : messages.select;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled && !checked}
        onChange={() => {
          onToggle(productId);
        }}
        aria-label={`${label}: ${productName}`}
        className="h-4 w-4 accent-primary"
      />
      <span aria-hidden="true">{label}</span>
    </label>
  );
}

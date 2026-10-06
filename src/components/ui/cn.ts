/** Joins class names, skipping falsy values. Internal helper for ui primitives. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter((c): c is string => Boolean(c)).join(' ');
}

import { redirect } from 'next/navigation';

/** Root redirects to the default locale (see middleware + ADR 0006). */
export default function RootPage() {
  redirect('/en');
}

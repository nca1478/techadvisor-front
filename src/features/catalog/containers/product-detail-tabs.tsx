'use client';

import { Tabs } from '@/components/ui/tabs';
import { ProductAdvisor } from '@/features/advisor';
import { ProductReviewsList, ReviewFormCard } from '@/features/reviews';
import type { Dictionary } from '@/lib/i18n/index';

export interface ProductDetailTabsProps {
  productId: string;
  categorySlug: string;
  locale: string;
  supportHref: string;
  loginHref: string;
  loginLabel: string;
  messages: Dictionary;
}

/**
 * Client composition for the product-page lower sections: customer reviews,
 * write-a-review and the product advisor behind tabs (reviews first).
 * Only the active panel mounts, so the advisor session and the form state
 * open lazily when their tab is selected.
 */
export function ProductDetailTabs({
  productId,
  categorySlug,
  locale,
  supportHref,
  loginHref,
  loginLabel,
  messages,
}: ProductDetailTabsProps) {
  return (
    <Tabs
      label={messages.catalog.detailTabsLabel}
      defaultId="reviews"
      items={[
        {
          id: 'reviews',
          label: messages.reviews.title,
          content: (
            <ProductReviewsList productId={productId} locale={locale} messages={messages.reviews} />
          ),
        },
        {
          id: 'write',
          label: messages.reviews.formTitle,
          content: (
            <ReviewFormCard
              productId={productId}
              messages={messages.reviews}
              loginHref={loginHref}
              loginLabel={loginLabel}
            />
          ),
        },
        {
          id: 'advisor',
          label: messages.advisor.title,
          content: (
            <ProductAdvisor
              key={productId}
              productId={productId}
              categorySlug={categorySlug}
              locale={locale}
              supportHref={supportHref}
              messages={messages.advisor}
            />
          ),
        },
      ]}
    />
  );
}

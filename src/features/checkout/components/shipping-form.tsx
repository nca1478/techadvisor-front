import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { countryOptions } from '../countries';

export interface ShippingFormMessages {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  countryPlaceholder: string;
  phone: string;
  required: string;
  invalidCountry: string;
}

export type ShippingField =
  'fullName' | 'line1' | 'line2' | 'city' | 'region' | 'postalCode' | 'country' | 'phone';

/** Presentational international address form (validation lives upstairs). */
export function ShippingForm({
  locale,
  values,
  errors,
  messages,
  onChange,
}: {
  locale: string;
  values: Record<ShippingField, string>;
  errors: Partial<Record<ShippingField, string>>;
  messages: ShippingFormMessages;
  onChange: (field: ShippingField, value: string) => void;
}) {
  return (
    <Stack gap="md">
      <Input
        label={messages.fullName}
        name="fullName"
        autoComplete="name"
        value={values.fullName}
        error={errors.fullName}
        onChange={(event) => {
          onChange('fullName', event.target.value);
        }}
      />
      <Input
        label={messages.line1}
        name="line1"
        autoComplete="street-address"
        value={values.line1}
        error={errors.line1}
        onChange={(event) => {
          onChange('line1', event.target.value);
        }}
      />
      <Input
        label={messages.line2}
        name="line2"
        autoComplete="address-line2"
        value={values.line2}
        error={errors.line2}
        onChange={(event) => {
          onChange('line2', event.target.value);
        }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={messages.city}
          name="city"
          autoComplete="address-level2"
          value={values.city}
          error={errors.city}
          onChange={(event) => {
            onChange('city', event.target.value);
          }}
        />
        <Input
          label={messages.region}
          name="region"
          autoComplete="address-level1"
          value={values.region}
          error={errors.region}
          onChange={(event) => {
            onChange('region', event.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={messages.postalCode}
          name="postalCode"
          autoComplete="postal-code"
          value={values.postalCode}
          error={errors.postalCode}
          onChange={(event) => {
            onChange('postalCode', event.target.value);
          }}
        />
        <Input
          label={messages.phone}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => {
            onChange('phone', event.target.value);
          }}
        />
      </div>
      <Select
        label={messages.country}
        name="country"
        autoComplete="country"
        value={values.country}
        error={errors.country}
        placeholder={messages.countryPlaceholder}
        options={countryOptions(locale)}
        onChange={(event) => {
          onChange('country', event.target.value);
        }}
      />
    </Stack>
  );
}

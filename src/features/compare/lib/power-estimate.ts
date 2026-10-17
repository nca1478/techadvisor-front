import type { CompareProduct } from '@/lib/api/compare';

/**
 * Deterministic power estimate for the compare page, computed client-side
 * from the SQL `specs` the backend already returns (`tdp_w` on CPUs/GPUs,
 * `wattage_w` on PSUs). Mirrors the backend rule engine so both agree:
 * estimated draw = base board/RAM/drive/fan load + every TDP found, and the
 * recommended PSU adds the same headroom.
 */

// mantener en sync con backend: PSU_BASE_LOAD_W / PSU_HEADROOM_FACTOR en
// `backend/src/modules/compatibility/rules/rules.ts`.
export const POWER_BASE_LOAD_W = 100;
export const POWER_HEADROOM_FACTOR = 1.2;

export interface PowerContributor {
  productId: string;
  name: string;
  tdpW: number;
}

export interface PowerSupply {
  productId: string;
  name: string;
  wattageW: number;
}

export type PowerVerdict = 'sufficient' | 'insufficient' | 'no-psu' | 'unknown-tdp';

export interface PowerEstimate {
  contributors: PowerContributor[];
  supplies: PowerSupply[];
  /** Base load + every TDP found, in watts. */
  estimatedW: number;
  /** Estimated draw plus headroom, rounded up. */
  requiredW: number;
  strongestSupplyW: number | null;
  verdict: PowerVerdict;
}

function asNonNegativeInt(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return undefined;
  return value;
}

/**
 * Builds the estimate, or `null` when no compared product carries any power
 * spec (the card stays hidden instead of showing an empty panel). Products
 * with a malformed `tdp_w`/`wattage_w` are ignored, never guessed.
 */
export function estimatePower(products: readonly CompareProduct[]): PowerEstimate | null {
  const contributors: PowerContributor[] = [];
  const supplies: PowerSupply[] = [];
  let hasMalformed = false;

  for (const product of products) {
    const tdp = product.specs['tdp_w'];
    if (tdp !== undefined) {
      const parsed = asNonNegativeInt(tdp);
      if (parsed === undefined) {
        hasMalformed = true;
      } else {
        contributors.push({ productId: product.productId, name: product.name, tdpW: parsed });
      }
    }
    const wattage = product.specs['wattage_w'];
    if (wattage !== undefined) {
      const parsed = asNonNegativeInt(wattage);
      if (parsed === undefined) {
        hasMalformed = true;
      } else {
        supplies.push({ productId: product.productId, name: product.name, wattageW: parsed });
      }
    }
  }

  if (contributors.length === 0 && supplies.length === 0) return null;

  const estimatedW = POWER_BASE_LOAD_W + contributors.reduce((sum, entry) => sum + entry.tdpW, 0);
  const requiredW = Math.ceil(estimatedW * POWER_HEADROOM_FACTOR);
  const strongestSupplyW =
    supplies.length > 0 ? Math.max(...supplies.map((entry) => entry.wattageW)) : null;

  let verdict: PowerVerdict;
  if (hasMalformed || contributors.length === 0) {
    verdict = 'unknown-tdp';
  } else if (strongestSupplyW === null) {
    verdict = 'no-psu';
  } else {
    verdict = strongestSupplyW >= requiredW ? 'sufficient' : 'insufficient';
  }

  return { contributors, supplies, estimatedW, requiredW, strongestSupplyW, verdict };
}

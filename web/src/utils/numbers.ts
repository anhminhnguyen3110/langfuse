import Decimal from "decimal.js";

export const compactNumberFormatter = (
  number?: number | bigint,
  maxFractionDigits?: number,
) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: maxFractionDigits ?? 2,
  }).format(number ?? 0);
};

/**
 * Specialized formatter for very small numbers (10^-3 to 10^-15 range)
 * Uses scientific notation for compact representation with ~3 significant digits
 */
export const compactSmallNumberFormatter = (
  number?: number | bigint,
  significantDigits: number = 3,
) => {
  const num = Number(number ?? 0);

  if (num === 0) return "0";

  const absNum = Math.abs(num);

  // For numbers >= 1e-3, use standard compact formatting
  if (absNum >= 1e-3) {
    return compactNumberFormatter(num, significantDigits);
  }

  // For very small numbers, use scientific notation
  return num.toExponential(significantDigits - 1);
};

export const numberFormatter = (
  number?: number | bigint,
  fractionDigits?: number,
) => {
  return Intl.NumberFormat("en-US", {
    notation: "standard",
    useGrouping: true,
    minimumFractionDigits: fractionDigits ?? 2,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(number ?? 0);
};

export const latencyFormatter = (milliseconds?: number) => {
  return Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((milliseconds ?? 0) / 1000);
};

export const usdFormatter = (
  number?: number | bigint | Decimal,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 6,
) => {
  const numberToFormat = number instanceof Decimal ? number.toNumber() : number;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#minimumfractiondigits
    minimumFractionDigits,
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#maximumfractiondigits
    maximumFractionDigits,
  }).format(numberToFormat ?? 0);
};

export const formatTokenCounts = (
  inputUsage?: number | null,
  outputUsage?: number | null,
  totalUsage?: number | null,
  showLabels = false,
): string => {
  if (!inputUsage && !outputUsage && !totalUsage) return "";

  return showLabels
    ? `${numberFormatter(inputUsage ?? 0, 0)} prompt → ${numberFormatter(outputUsage ?? 0, 0)} completion (∑ ${numberFormatter(totalUsage ?? 0, 0)})`
    : `${numberFormatter(inputUsage ?? 0, 0)} → ${numberFormatter(outputUsage ?? 0, 0)} (∑ ${numberFormatter(totalUsage ?? 0, 0)})`;
};

export function randomIntFromInterval(min: number, max: number) {
  // Use cryptographically secure randomness both on Node and in the browser.
  // Lightweight xorshift fallback (non-crypto) used when true crypto is not available.
  function xorshift32(seed: number) {
    let x = seed | 0;
    return () => {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967296;
    };
  }
  if (typeof window === "undefined") {
    // Node.js / SSR environment
    // Try to access a require implementation from globalThis to avoid bundling `node:crypto` into client builds.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nonWebpackRequire = (globalThis as any)?.__non_webpack_require__;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeRequire: any = (globalThis as any)?.require ?? (typeof nonWebpackRequire === "function" ? nonWebpackRequire : undefined);
    if (typeof nodeRequire === "function") {
      const crypto = nodeRequire("crypto");
      return crypto.randomInt(min, max + 1);
    }

    // If we can't require Node's crypto, use xorshift32 fallback so we don't call Math.random()
    const nodeSeed = Date.now() ^ ((globalThis as any)?.process?.pid ?? 0);
    const nodePrng = xorshift32(nodeSeed);
    return min + Math.floor(nodePrng() * (max - min + 1));
  }

  // Browser environment: use Web Crypto API
  if (typeof window.crypto?.getRandomValues === "function") {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return min + (arr[0] % (max - min + 1));
  }

  const seed = Date.now() ^ ((typeof performance !== "undefined" && typeof performance.now === "function") ? Math.floor(performance.now()) : 0);
  const prng = xorshift32(seed);
  return min + Math.floor(prng() * (max - min + 1));
}

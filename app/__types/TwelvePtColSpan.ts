// Branded type for compile-time tagging
export type PartitionOf12 = string & { readonly __brand: unique symbol };
export type PartitionOf6 = string & { readonly __brand: unique symbol };

export function isPartitionOf12(s: string): s is PartitionOf12 {
  const parts = s.split('-');
  if (parts.length < 1 || parts.length > 12) return false;
  let sum = 0;
  for (const p of parts) {
    if (!/^[1-9]\d*$/.test(p)) return false;   // no zero, no negatives, no junk
    const n = Number(p);
    if (n < 1 || n > 12) return false;
    sum += n;
  }
  return sum === 12;
}

export function isPartitionOf6(s: string): s is PartitionOf6 {
  const parts = s.split('-');
  if (parts.length < 1 || parts.length > 6) return false;
  let sum = 0;
  for (const p of parts) {
    if (!/^[1-9]\d*$/.test(p)) return false;   // no zero, no negatives, no junk
    const n = Number(p);
    if (n < 1 || n > 6) return false;
    sum += n;
  }
  return sum === 6;
}


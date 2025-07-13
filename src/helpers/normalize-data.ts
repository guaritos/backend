export function normalizeDataset(data: Record<string, any>): any[] {
  const result: any[] = [];

  for (const [originKey, originValue] of Object.entries(data)) {
    if (typeof originValue !== 'object' || originValue === null) continue;

    // If the object itself is map-like (e.g. a2)
    const isMapLike = Object.values(originValue).every(
      v => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean'
    );

    if (isMapLike) {
      for (const [k, v] of Object.entries(originValue)) {
        result.push({
          key: k,
          value: v,
          __origin: originKey,
          __source: originKey,
        });
      }
      continue;
    }

    // Otherwise, iterate fields inside the object (like a1)
    for (const [subKey, subValue] of Object.entries(originValue)) {
      if (Array.isArray(subValue)) {
        for (const item of subValue) {
          result.push({
            ...item,
            __origin: originKey,
            __source: subKey,
          });
        }
      } else if (
        typeof subValue === 'object' &&
        subValue !== null &&
        Object.values(subValue).every(
          v => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean'
        )
      ) {
        for (const [k, v] of Object.entries(subValue)) {
          result.push({
            key: k,
            value: v,
            __origin: originKey,
            __source: subKey,
          });
        }
      }
    }
  }

  return result;
}

import { SortOrder } from '../dtos/sorting.dto';

export const sort = (items: any[], sortKey: string, sortOrder: SortOrder) => {
  return structuredClone(items).sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (valA === valB) return 0;

    const modifier = sortOrder === SortOrder.DESC ? -1 : 1;

    return valA < valB ? -1 * modifier : 1 * modifier;
  });
};

export const paginate = (items: any[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return items.slice(start, end);
};

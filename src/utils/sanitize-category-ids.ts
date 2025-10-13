export function sanitizeCategoryIds(ids: string): number[] {
  if (!ids || ids.trim() === '') return [];
  return ids
    .split(',')
    .map(Number)
    .filter((id) => !isNaN(id));
}

export function buildWhereClause(
  query: Record<string, any>,
  allowedFilters: string[]
): { where: string; values: any[] } {
  const whereClauses: string[] = [];
  const values: any[] = [];

  for (const key of allowedFilters) {
    if (query[key]) {
      if (typeof query[key] === 'object' && query[key].min !== undefined && query[key].max !== undefined) {
        whereClauses.push(`${key} BETWEEN ? AND ?`);
        values.push(query[key].min, query[key].max);
      } else {
        whereClauses.push(`${key}=?`);
        values.push(query[key]);
      }
    }
  }

  if (!whereClauses.length) {
    console.log('No WHERE conditions applied, fetching all data');
  }

  const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  return {
    where: whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '',
    values,
  };
}

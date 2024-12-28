export function buildWhereClause(
  query: Record<string, any>,
  allowedFilters: string[]
): { where: string; values: any[] } {
  const whereClauses: string[] = [];
  const values: any[] = [];

  for (const key of allowedFilters) {
    if (query[key]) {
      if (typeof query[key] === 'object' && query[key].min !== undefined && query[key].max !== undefined) {
        whereClauses.push(`${key} BETWEEN ? AMD ?`);
        values.push(query[key].min, query[key].max);
      } else {
        whereClauses.push(`${key}=?`);
        values.push(query[key]);
      }
    }
  }

  return {
    where: whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '',
    values,
  };
}

export function isEcoarCatalogSchemaMissingError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const o = err as { code?: string; message?: string }
  if (o.code === '42P01') return true
  // Missing table/view
  if (typeof o.message === 'string' && /does not exist/i.test(o.message) && (/relation/i.test(o.message) || /table/i.test(o.message))) {
    return true
  }
  // Missing column
  if (o.code === '42703') return true
  if (typeof o.message === 'string' && /column/i.test(o.message) && /does not exist/i.test(o.message)) {
    return true
  }
  return false
}

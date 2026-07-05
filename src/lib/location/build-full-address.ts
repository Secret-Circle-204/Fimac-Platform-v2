/**
 * Constructs a standardized full address string.
 */
export function buildFullAddress(
  street: string,
  city: string,
  state: string,
  zip?: string
): string {
  const parts = [
    street.trim(),
    city.trim(),
    state.trim()
  ]
  
  const base = parts.filter(Boolean).join(', ')
  return zip ? `${base} ${zip.trim()}` : base
}

export function formatPrice(price: number | null | undefined, currency?: string | null): string {
  if (price == null) {return 'Price not available'}

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

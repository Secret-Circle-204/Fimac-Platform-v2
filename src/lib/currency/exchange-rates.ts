const CACHE_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours

export interface ExchangeRatesData {
  rates: Record<string, number>
  timestamp: number
}

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EGP: 50.0,
  EUR: 52.0,
}

let cachedRates: Record<string, number> | null = null
let lastFetched = 0

/**
 * Fetches and resolves exchange rates relative to USD.
 * Caches results locally for 12 hours in-memory to prevent slow hook executions.
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now()
  if (cachedRates && (now - lastFetched < CACHE_DURATION_MS)) {
    return cachedRates
  }

  // Fetch fresh rates
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (data && data.rates) {
        const rates = {
          USD: 1.0,
          EGP: Number(data.rates.EGP) || FALLBACK_RATES.EGP,
          EUR: Number(data.rates.EUR) || FALLBACK_RATES.EUR,
        }

        // Save to in-memory cache
        cachedRates = rates
        lastFetched = Date.now()

        return rates
      }
    }
  } catch (err) {
    console.error('[ExchangeRates] Failed to fetch currency rates from API:', err)
  }

  // Fallback to stale cache if it exists, or fallback rates
  if (cachedRates) {
    console.warn('[ExchangeRates] Using stale exchange rates cache.')
    return cachedRates
  }

  console.warn('[ExchangeRates] Using default fallback exchange rates.')
  return FALLBACK_RATES
}

/**
 * Converts price from the source currency to USD based on the exchange rates.
 */
export async function convertPriceToUSD(price: number, fromCurrency: string): Promise<number> {
  const rates = await getExchangeRates()
  const rate = rates[fromCurrency.toUpperCase()]
  if (!rate) {
    console.warn(`[ExchangeRates] Unknown currency: ${fromCurrency}, defaulting rate to 1.0`)
    return price
  }
  return price / rate
}

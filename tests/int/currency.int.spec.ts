import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import { getExchangeRates, convertPriceToUSD } from '@/lib/currency/exchange-rates'

let payload: Payload

describe('Multi-Currency Property Pricing Integration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  describe('exchange rates utility', () => {
    it('should fetch exchange rates successfully', async () => {
      const rates = await getExchangeRates()
      expect(rates).toBeDefined()
      expect(rates.USD).toBe(1.0)
      expect(rates.EGP).toBeGreaterThan(10)
      expect(rates.EUR).toBeLessThan(2.0)
    })

    it('should convert prices correctly', async () => {
      const rates = await getExchangeRates()
      
      const usdPrice = await convertPriceToUSD(100, 'USD')
      expect(usdPrice).toBe(100)
      
      const egpPrice = await convertPriceToUSD(100, 'EGP')
      expect(egpPrice).toBeCloseTo(100 / rates.EGP)
    })
  })

  describe('Payload hook integration', () => {
    it('should calculate basePriceInUSD automatically when creating a property', async () => {
      const rates = await getExchangeRates()
      const priceVal = 5000000 // 5 Million
      
      // Fetch dynamic forsale listing status ID
      const statusRes = await payload.find({
        collection: 'listing-statuses',
        where: { slug: { equals: 'forsale' } },
        limit: 1,
      })
      const forsaleId = statusRes.docs[0]?.id

      const property = await payload.create({
        collection: 'properties',
        data: {
          title: 'Test Currency Property',
          description: 'A temporary property for multi-currency testing.',
          price: priceVal,
          currency: 'EGP',
          listingStatus: forsaleId,
          constructionStatus: 'ready',
        },
      })

      expect(property.price).toBe(priceVal)
      expect(property.currency).toBe('EGP')
      expect(property.basePriceInUSD).toBeCloseTo(priceVal / rates.EGP, 2)

      // Cleanup
      await payload.delete({
        collection: 'properties',
        id: property.id,
      })
    })
  })
})

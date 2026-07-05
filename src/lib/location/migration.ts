import type { Payload } from 'payload'
import { buildFullAddress } from './build-full-address'
import { normalizeAddress } from './normalize-address'

export interface MigrationSummary {
  scanned: number
  migrated: number
  failed: number
  missingCoords: number
  fallbackCases: number
  alreadyMigrated: number
  details: string[]
}

/**
 * Migration Script: Phase 2
 * Migrates data from legacy Locations collection to autonomous Property fields.
 * Includes dry-run mode and idempotency checks.
 */
export async function migrateLocationsToAutonomous(
  payload: Payload,
  options: { dryRun?: boolean; force?: boolean } = {}
): Promise<MigrationSummary> {
  const { dryRun = true, force = false } = options
  const summary: MigrationSummary = {
    scanned: 0,
    migrated: 0,
    failed: 0,
    missingCoords: 0,
    fallbackCases: 0,
    alreadyMigrated: 0,
    details: [],
  }

  payload.logger.info(`${dryRun ? '[DRY RUN] ' : ''}Starting Location Migration (Phase 2)...`)

  // 1. Fetch all properties with legacy location populated
  const properties = await payload.find({
    collection: 'properties',
    limit: 1000,
    depth: 1,
  })

  summary.scanned = properties.totalDocs
  payload.logger.info(`Found ${summary.scanned} properties to scan.`)

  for (const property of properties.docs) {
    try {
      // 2. Idempotency Check
      if (property.location?.meta?.source === 'imported' && !force) {
        summary.alreadyMigrated++
        continue
      }

      const legacyLoc = property.location_legacy
      const loc = (typeof legacyLoc === 'object' && legacyLoc !== null) ? legacyLoc : null
      
      if (!loc) {
        summary.fallbackCases++
        summary.details.push(`Property ${property.id}: Missing legacy location. Using manual fallback.`)
        // We can still try to migrate if 'street' exists, but coordinates will be missing
      }

      // 3. Coordinate Handling
      const lat = loc?.latitude || 0
      const lng = loc?.longitude || 0
      if (lat === 0 && lng === 0) {
        summary.missingCoords++
        summary.details.push(`Property ${property.id}: Warning - Coordinates are 0,0.`)
      }

      // 4. Address Data Preparation
      const street = property.street || ''
      const city = loc?.city || ''
      const state = loc?.state_name || loc?.state_abbr || ''
      const zip = loc?.zip || ''

      const address = {
        street,
        city,
        state,
        zip,
        fullAddress: buildFullAddress(street, city, loc?.state_abbr || '', zip)
      }

      const search = normalizeAddress(
        address.street,
        address.city,
        address.state,
        address.zip
      )

      // 6. Update Execution
      if (!dryRun) {
        await payload.update({
          collection: 'properties',
          id: property.id,
          data: {
            location: {
              geo: { lat, lng },
              address,
              search,
              meta: {
                source: 'imported',
                extractedAt: new Date().toISOString(),
                extractionConfidence: lat !== 0 ? 1.0 : 0.5
              }
            }
          }
        })
        summary.migrated++
      } else {
        summary.details.push(`[DRY RUN] Would migrate property ${property.id}: ${address.fullAddress}`)
        summary.migrated++ // Count as "would be migrated" for the summary
      }

    } catch (err) {
      summary.failed++
      summary.details.push(`Property ${property.id}: Error - ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  }

  // 7. Final Report
  payload.logger.info('--- Migration Summary Report ---')
  payload.logger.info(`Total Scanned:      ${summary.scanned}`)
  payload.logger.info(`Successfully Migrated: ${summary.migrated}`)
  payload.logger.info(`Already Migrated:   ${summary.alreadyMigrated}`)
  payload.logger.info(`Failed:             ${summary.failed}`)
  payload.logger.info(`Missing Coordinates: ${summary.missingCoords}`)
  payload.logger.info(`Fallback Cases:     ${summary.fallbackCases}`)
  payload.logger.info('---------------------------------')

  return summary
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIMAC Globe Clustering Engine — Spatial Index
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Wraps the supercluster library for O(log N) spatial queries.
 *  Built once on data load, queried per camera change.
 *
 *  Replaces the O(N) toFixed(2) grouping with proper geospatial
 *  clustering that adapts dynamically to zoom level.
 */

import Supercluster from 'supercluster'
import type { Property } from '@/payload-types'
import type { ClusterPoint, GlobePropertyData, SuperclusterPropertyPayload } from './types'
import { CLUSTER_CONFIG, ALTITUDE_ZOOM_FACTOR, ALTITUDE_ZOOM_MIN, ALTITUDE_ZOOM_MAX } from './config'
import { isValidCoordinate } from '@/lib/geo/is-valid-coordinate'
import { buildPropertyUrl } from '@/repository/property/generate-url'

/** GeoJSON Feature type expected by supercluster */
interface GeoJSONPointFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  properties: SuperclusterPropertyPayload
}

/**
 * SpatialIndex provides O(log N) spatial clustering for globe properties.
 *
 * Usage:
 * ```ts
 * const index = new SpatialIndex()
 * index.load(properties)
 * const clusters = index.getClustersForAltitude(lat, lng, altitude)
 * ```
 */
export class SpatialIndex {
  private index: Supercluster<SuperclusterPropertyPayload>

  constructor() {
    this.index = new Supercluster<SuperclusterPropertyPayload>({
      radius: CLUSTER_CONFIG.clusterRadius,
      maxZoom: CLUSTER_CONFIG.clusterMaxZoom,
      minZoom: 0,
      minPoints: 2,
    })
    this.index.load([])
  }

  /**
   * Builds the spatial index from a Property[] array.
   * Called ONCE when data loads or changes. O(N log N) build cost.
   *
   * @returns The number of valid geo-points indexed
   */
  load(properties: Property[]): number {
    const features: GeoJSONPointFeature[] = []

    // Group properties by exact coordinates
    const coordsMap = new Map<string, Property[]>()

    for (const prop of properties) {
      const geo = prop.location?.geo
      if (!geo || geo.lat == null || geo.lng == null) continue

      const lat = Number(geo.lat)
      const lng = Number(geo.lng)
      if (!isValidCoordinate(lat, lng)) continue

      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
      if (!coordsMap.has(key)) coordsMap.set(key, [])
      coordsMap.get(key)?.push(prop)
    }

    coordsMap.forEach((groupProps, key) => {
      const [baseLat, baseLng] = key.split(',').map(Number)
      const count = groupProps.length

      groupProps.forEach((prop, index) => {
        let finalLat = baseLat
        let finalLng = baseLng

        // If multiple properties share the same spot, spread them in a small circle
        if (count > 1) {
          const angle = (index / count) * 2 * Math.PI
          // Small offset radius (approx 3km on globe for visibility)
          const radius = 0.03
          finalLat += radius * Math.cos(angle)
          finalLng += radius * Math.sin(angle)
        }

        const address = prop.location?.address
        const propertyData: GlobePropertyData = {
          id: prop.id,
          lat: finalLat,
          lng: finalLng,
          title: prop.title,
          price: prop.price,
          currency: prop.currency,
          status:
            typeof prop.listingStatus === 'object' && prop.listingStatus
              ? prop.listingStatus.slug
              : typeof prop.listingStatus === 'string'
                ? prop.listingStatus
                : undefined,
          beds: prop.details?.bedrooms,
          baths: prop.details?.bathrooms,
          sqM: prop.details?.squareMeters,
          type:
            typeof prop.propertyType === 'object' && prop.propertyType !== null
              ? prop.propertyType.name
              : undefined,
          img:
            prop.photos?.[0] &&
            typeof prop.photos[0] === 'object' &&
            'url' in prop.photos[0]
              ? prop.photos[0].sizes?.thumbnail?.url || prop.photos[0].url
              : undefined,
          city: address?.city,
          state: address?.state,
          url:
            (prop as unknown as { url?: string }).url ||
            buildPropertyUrl(prop.id, address || { street: prop.street }),
        }

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [finalLng, finalLat], // GeoJSON is [lng, lat]
          },
          properties: { propertyData },
        })
      })
    })

    this.index.load(features)
    return features.length
  }

  /**
   * Returns visible clusters/points for a given camera position.
   *
   * @param cameraLat - Camera center latitude
   * @param cameraLng - Camera center longitude
   * @param altitude - Globe camera altitude (in globe radii)
   * @returns Typed ClusterPoint array, ready for rendering
   */
  getClustersForAltitude(
    cameraLat: number,
    cameraLng: number,
    altitude: number,
  ): ClusterPoint[] {
    const zoom = this.altitudeToZoom(altitude)
    // Query the entire globe to keep clusters in sync during auto-rotation or dragging
    const raw = this.index.getClusters([-180, -90, 180, 90], zoom)
    const results: ClusterPoint[] = []

    for (const feature of raw) {
      const [lng, lat] = feature.geometry.coordinates
      const props = feature.properties

      if ('cluster' in props && props.cluster === true) {
        // Cluster: get representative leaf for display data
        const clusterProps = props as {
          cluster: true
          cluster_id: number
          point_count: number
          point_count_abbreviated: number | string
        }

        const leaves = this.index.getLeaves(clusterProps.cluster_id, 3)
        const representative = leaves[0]?.properties?.propertyData

        if (!representative) continue

        const clusterImages = leaves
          .map((leaf: Supercluster.PointFeature<SuperclusterPropertyPayload>) => leaf.properties?.propertyData?.img)
          .filter((img: string | null | undefined): img is string => typeof img === 'string' && img !== '')

        results.push({
          id: `cluster-${clusterProps.cluster_id}`,
          lat,
          lng,
          isCluster: true,
          clusterId: clusterProps.cluster_id,
          pointCount: clusterProps.point_count,
          representative,
          clusterImages,
        })
      } else {
        // Individual point (leaf)
        const leafProps = props as SuperclusterPropertyPayload
        const propertyData = leafProps.propertyData

        results.push({
          id: propertyData.id,
          lat,
          lng,
          isCluster: false,
          clusterId: null,
          pointCount: 1,
          representative: propertyData,
        })
      }
    }

    return results
  }

  /**
   * Returns all individual properties within a cluster.
   * Used by the spiderfy expansion to show individual pins.
   *
   * @param clusterId - Supercluster internal cluster ID
   * @param limit - Max number of leaves to return
   */
  getClusterLeaves(clusterId: number, limit: number): GlobePropertyData[] {
    const leaves = this.index.getLeaves(clusterId, limit)
    return leaves
      .map((leaf: Supercluster.PointFeature<SuperclusterPropertyPayload>) => leaf.properties?.propertyData)
      .filter((data: GlobePropertyData | undefined): data is GlobePropertyData => data !== undefined)
  }

  /**
   * Returns the zoom level at which a cluster expands.
   * Used to decide the fly-to zoom for large clusters.
   */
  getExpansionZoom(clusterId: number): number {
    return this.index.getClusterExpansionZoom(clusterId)
  }

  // ─── Private Helpers ────────────────────────────────────────────

  /**
   * Maps globe camera altitude to supercluster zoom level.
   * Lower altitude (closer) = higher zoom = fewer/smaller clusters.
   */
  private altitudeToZoom(altitude: number): number {
    // Empirically tuned mapping:
    // altitude 2.5 → zoom ≈ 2  (whole globe visible, big clusters)
    // altitude 1.0 → zoom ≈ 4  (continent level)
    // altitude 0.5 → zoom ≈ 8  (country level)
    // altitude 0.2 → zoom ≈ 16 (city level, no clustering)
    const zoom = Math.round(ALTITUDE_ZOOM_FACTOR / Math.max(altitude, 0.05))
    return Math.max(ALTITUDE_ZOOM_MIN, Math.min(ALTITUDE_ZOOM_MAX, zoom))
  }

  /**
   * Computes a geographic bounding box visible at the given camera position.
   * Returns [westLng, southLat, eastLng, northLat] as required by supercluster.
   */
  private computeVisibleBbox(
    lat: number,
    lng: number,
    altitude: number,
  ): [number, number, number, number] {
    // Approximate angular spread visible at this altitude
    // Higher altitude → wider field of view
    const latSpread = Math.min(90, altitude * 40)
    const lngSpread = Math.min(180, altitude * 60)

    return [
      Math.max(-180, lng - lngSpread), // west
      Math.max(-90, lat - latSpread),  // south
      Math.min(180, lng + lngSpread),  // east
      Math.min(90, lat + latSpread),   // north
    ]
  }
}

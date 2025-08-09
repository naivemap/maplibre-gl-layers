import earcut, { flatten } from 'earcut'
import * as GeoJSON from 'geojson'

/**
 * The properties for masking the image layer.
 */
export interface MaskProperty {
  /**
   * The type of mask operation to perform.
   * - 'in': The image will be visible only within the mask area.
   * - 'out': The image will be visible outside the mask area.
   * If not specified, defaults to 'in'.
   * @default 'in'
   */
  type?: 'in' | 'out'
  /**
   * The mask data, supporting inline GeoJSON and remote addresses.
   */
  data: GeoJSON.GeoJSON | string
}

/**
 * Extracts a polygon or multipolygon from GeoJSON data.
 * Supports GeoJSON types: Polygon, MultiPolygon, Feature, and FeatureCollection.
 * @param data
 * @returns
 */
export function extractPolygon(data: GeoJSON.GeoJSON) {
  if (Object.prototype.hasOwnProperty.call(data, 'type')) {
    const type = data.type
    if (type === 'Polygon' || type === 'MultiPolygon') {
      // Geometry type: 'Polygon' or 'MultiPolygon'
      return data
    } else if (type === 'Feature' && (data.geometry.type === 'Polygon' || data.geometry.type === 'MultiPolygon')) {
      // Feature
      return data.geometry
    } else if (type === 'FeatureCollection') {
      // FeatureCollection
      const features = data.features.filter(
        (feature: GeoJSON.Feature) => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
      )
      if (features.length === 1) {
        return features[0].geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
      } else if (features.length > 1) {
        // 合并多个 Polygon 或 MultiPolygon
        const polygonCoords: GeoJSON.Position[][][] = []

        for (const feature of features) {
          const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
          if (geometry.type === 'MultiPolygon') {
            // 多个 Polygon
            for (const coordinate of geometry.coordinates) {
              // 单个 Polygon
              polygonCoords.push(coordinate)
            }
          } else {
            // 单个 Polygon
            polygonCoords.push(geometry.coordinates)
          }
        }
        return {
          type: 'MultiPolygon',
          coordinates: polygonCoords
        } as GeoJSON.MultiPolygon
      } else {
        throw new Error('No valid Polygon or MultiPolygon features found')
      }
    } else {
      throw new Error('Invalid GeoJSON format, only support Polygon, MultiPolygon, Feature, FeatureCollection')
    }
  } else {
    throw new Error('Invalid GeoJSON format')
  }
}

export function extractPolygonAsync(data: GeoJSON.GeoJSON | string) {
  if (typeof data === 'string') {
    return fetch(data)
      .then((res) => res.json())
      .then((res) => {
        return extractPolygon(res)
      })
  } else {
    return Promise.resolve(extractPolygon(data))
  }
}

/**
 * 三角化多边形
 * @param poly 多边形
 * @param poly
 * @returns 顶点和三角形索引
 */
export function earcutPolygon(poly: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
  let positions: number[] = []
  let triangles: number[] = []

  if (poly.type === 'MultiPolygon') {
    // type: 'MultiPolygon'
    const polyCount = poly.coordinates.length
    let triangleStartIndex = 0
    for (let i = 0; i < polyCount; i++) {
      const coordinates = poly.coordinates[i]
      const flattened = flatten(coordinates)
      const { vertices, holes, dimensions } = flattened
      const triangle = earcut(vertices, holes, dimensions)
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const triangleNew = triangle.map((item) => item + triangleStartIndex)

      triangleStartIndex += vertices.length / 2

      for (let m = 0; m < vertices.length; m++) {
        positions.push(vertices[m])
      }
      for (let n = 0; n < triangleNew.length; n++) {
        triangles.push(triangleNew[n])
      }
    }
  } else {
    // type: 'Polygon'
    const flattened = flatten(poly.coordinates)
    const { vertices, holes, dimensions } = flattened
    positions = vertices
    triangles = earcut(vertices, holes, dimensions)
  }

  return {
    vertices: positions,
    indices: triangles
  }
}

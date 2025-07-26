import earcut, { flatten } from 'earcut'
import maplibregl from 'maplibre-gl'
import * as twgl from 'twgl.js'
import type { ArrugadoFlat, Coordinates } from './arrugator'
import { initArrugator } from './arrugator'
import fs from './shaders/image.fragment.glsl'
import vs from './shaders/image.vertex.glsl'
import maskfs from './shaders/mask.fragment.glsl'
import maskvs from './shaders/mask.vertex.glsl'

/**
 * The properties for masking the image layer.
 */
export type MaskProperty = {
  /**
   * The type of mask to apply.
   * - 'in': The mask is applied inside the polygon (default).
   * - 'out': The mask is applied outside the polygon.
   */
  type?: 'in' | 'out'
  /**
   * The data for the mask, which can be a GeoJSON Polygon or MultiPolygon.
   * If not provided, no mask will be applied.
   */
  data: GeoJSON.Polygon | GeoJSON.MultiPolygon
}

/**
 * The options for the ImageLayer.
 */
export type ImageOption = {
  /**
   * URL that points to an image.
   */
  url: string
  /**
   * The projection of the image, typically an EPSG code like 'EPSG:4326'.
   */
  projection: string
  /**
   * Corners of image specified in longitude, latitude pairs.
   */
  coordinates: Coordinates
  /**
   * The resampling/interpolation method to use for overscaling.
   * - 'linear': Linear interpolation (default).
   * - 'nearest': Nearest neighbor interpolation.
   * If not specified, the default is 'linear'.
   */
  resampling?: 'linear' | 'nearest'
  /**
   * Opacity of the image layer, ranging from 0 (fully transparent) to 1 (fully opaque).
   * Defaults to 1.
   */
  opacity?: number
  /**
   * Cross-origin attribute for the image, which can be used to specify how the image should be fetched.
   * Defaults to 'anonymous'.
   */
  crossOrigin?: string
  /**
   * The step size for the Arrugator algorithm, which controls the granularity of the image rendering.
   */
  arrugatorStep?: number
  /**
   * Masking properties for the image layer.
   * If not provided, no mask will be applied.
   */
  mask?: MaskProperty
}

/**
 * A custom MapLibre GL JS layer for rendering georeferenced images with arbitrary projections.
 *
 * @remarks
 * This layer uses `proj4js` to transform image coordinates from any source projection
 * into the map's coordinate system. It triangulates the image corners to correctly
 * warp and display it on the map canvas. This is ideal for overlaying historical maps,
 * floor plans, or other non-standard raster data.
 *
 * @example
 * ```ts
 * import ImageLayer from '@naivemap/maplibre-gl-image-layer';
 * import proj4 from 'proj4';
 *
 * // 1. Define the source projection if it's not standard
 * proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs');
 *
 * // 2. Create the layer instance
 * const layer = new ImageLayer('image-layer', {
 *   url: 'https://example.com/my-image.png',
 *   coordinates: [
 *     [100000, 6700000], // Top-left corner in source projection
 *     [110000, 6700000], // Top-right
 *     [110000, 6600000], // Bottom-right
 *     [100000, 6600000]  // Bottom-left
 *   ],
 *   projection: 'EPSG:2154'
 * });
 *
 * // 3. Add the layer to the map
 * map.addLayer(layer);
 * ```
 */
export default class ImageLayer implements maplibregl.CustomLayerInterface {
  id: string
  /**
   * @ignore
   */
  type: 'custom' = 'custom' as const
  /**
   * @ignore
   */
  renderingMode?: '2d' | '3d' | undefined = '2d'
  private option: ImageOption

  private map?: maplibregl.Map
  private gl?: WebGLRenderingContext

  private loaded: boolean
  private arrugado: ArrugadoFlat

  // texture
  private programInfo?: twgl.ProgramInfo
  private bufferInfo?: twgl.BufferInfo
  private texture?: WebGLTexture
  // mask
  private maskProperty: MaskProperty
  private maskProgramInfo?: twgl.ProgramInfo
  private maskBufferInfo?: twgl.BufferInfo

  /**
   * @param id - A unique layer id
   * @param option - ImageLayer options
   */
  constructor(id: string, option: ImageOption) {
    this.id = id
    this.option = option
    this.loaded = false
    this.maskProperty = Object.assign({ type: 'in' }, option.mask)

    // 初始化 Arrugator
    const { projection, coordinates } = option
    this.arrugado = initArrugator(projection, coordinates, option.arrugatorStep)
  }

  /**
   * @ignore
   */
  onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
    this.map = map
    this.gl = gl

    // 主程序
    this.programInfo = twgl.createProgramInfo(gl, [vs, fs])

    this.loadTexture(map, gl)
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_pos: { numComponents: 2, data: this.arrugado.pos },
      a_uv: { numComponents: 2, data: this.arrugado.uv },
      indices: this.arrugado.trigs
    })

    // 掩膜程序
    if (this.maskProperty.data) {
      const { data } = this.maskProperty
      if (data) {
        this.maskProgramInfo = twgl.createProgramInfo(gl, [maskvs, maskfs])
        this.maskBufferInfo = this.getMaskBufferInfo(gl, data)
      }
    }
  }

  /**
   * @ignore
   */
  onRemove(_: maplibregl.Map, gl: WebGLRenderingContext) {
    if (this.programInfo) {
      gl.deleteProgram(this.programInfo.program)
    }
    if (this.maskProgramInfo) {
      gl.deleteProgram(this.maskProgramInfo.program)
    }
    if (this.texture) {
      gl.deleteTexture(this.texture)
    }
  }

  /**
   * @ignore
   */
  render(gl: WebGLRenderingContext, args: any): void {
    // @ts-ignore
    if (this.map && !this.map.painter.terrain) {
      // @ts-ignore
      this.map.painter.currentStencilSource = undefined
      this.map.painter._tileClippingMaskIDs = {}
    }

    if (this.loaded && this.programInfo && this.bufferInfo) {
      const matrix = args.defaultProjectionData.mainMatrix
      // blend
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      if (this.maskProgramInfo && this.maskBufferInfo) {
        // mask program
        gl.useProgram(this.maskProgramInfo.program)

        // stencil test
        gl.enable(gl.STENCIL_TEST)
        gl.stencilFunc(gl.ALWAYS, 1, 0xff)
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE)
        gl.stencilMask(0xff)

        gl.clear(gl.STENCIL_BUFFER_BIT)

        // matrix
        twgl.setUniforms(this.maskProgramInfo, { u_matrix: matrix })
        // pos & indices
        twgl.setBuffersAndAttributes(gl, this.maskProgramInfo, this.maskBufferInfo)
        // draw
        let elementType: number = gl.UNSIGNED_SHORT
        if (this.maskBufferInfo.numElements / 3 > 65535) {
          // 使 drawElements 支持 UNSIGNED_INT 类型
          gl.getExtension('OES_element_index_uint')
          elementType = gl.UNSIGNED_INT
        }
        gl.drawElements(gl.TRIANGLES, this.maskBufferInfo.numElements, elementType, 0)
      }

      // texture program
      gl.useProgram(this.programInfo.program)

      if (this.maskProgramInfo?.program) {
        // stencil test
        const ref = this.maskProperty.type === 'out' ? 0 : 1
        gl.stencilFunc(gl.EQUAL, ref, 0xff)
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
      }

      // uniforms
      twgl.setUniforms(this.programInfo, {
        u_matrix: matrix,
        u_opacity: this.option.opacity ?? 1,
        u_sampler: this.texture
      })
      // pos, uv & indices
      twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
      // draw
      gl.drawElements(gl.TRIANGLES, this.arrugado.trigs.length, gl.UNSIGNED_SHORT, 0)

      gl.clear(gl.STENCIL_BUFFER_BIT)
      gl.disable(gl.STENCIL_TEST)
    }
  }

  /**
   * Updates the URL, the projection, the coordinates, the opacity or the resampling of the image.
   * @param {Object} option Options object.
   * @param {string} [option.url] Image URL.
   * @param {string} [option.projection] Projection with EPSG code that points to the image..
   * @param {Array<Array<number>>} [option.coordinates] Four geographical coordinates,
   * @param {number} [option.opacity] opacity of the image.
   * @param {string} [option.resampling] The resampling/interpolation method to use for overscaling.
   */
  updateImage(option: {
    url?: string
    projection?: string
    coordinates?: Coordinates
    opacity?: number
    resampling?: 'linear' | 'nearest'
  }) {
    if (this.gl && this.map) {
      this.option.opacity = option.opacity ?? this.option.opacity
      if (option.projection || option.coordinates) {
        this.option.projection = option.projection ?? this.option.projection
        this.option.coordinates = option.coordinates ?? this.option.coordinates
        // reinit arrugator
        this.arrugado = initArrugator(this.option.projection, this.option.coordinates, this.option.arrugatorStep)
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
          a_pos: { numComponents: 2, data: this.arrugado.pos },
          a_uv: { numComponents: 2, data: this.arrugado.uv },
          indices: this.arrugado.trigs
        })
      }
      if (option.url || option.resampling) {
        this.loaded = false
        this.option.url = option.url ?? this.option.url
        this.option.resampling = option.resampling ?? this.option.resampling
        // reload image
        this.loadTexture(this.map, this.gl)
      } else {
        this.map.triggerRepaint()
      }
    }
    return this
  }

  /**
   * Updates the mask property
   * @param {MaskProperty} mask The mask property.
   */
  updateMask(mask: Partial<MaskProperty>) {
    if (this.gl && this.map) {
      if (mask.data) {
        if (!this.maskProgramInfo) {
          this.maskProgramInfo = twgl.createProgramInfo(this.gl, [maskvs, maskfs])
        }

        this.maskProperty = Object.assign(this.maskProperty, mask)
        this.maskBufferInfo = this.getMaskBufferInfo(this.gl, this.maskProperty.data)
      } else {
        this.maskProgramInfo && this.gl.deleteProgram(this.maskProgramInfo.program)
        this.maskProgramInfo = undefined
        this.maskBufferInfo = undefined
      }
      this.map.triggerRepaint()
    }
    return this
  }

  private loadTexture(map: maplibregl.Map, gl: WebGLRenderingContext) {
    // 创建纹理
    const filter = this.option.resampling === 'nearest' ? gl.NEAREST : gl.LINEAR

    this.texture = twgl.createTexture(
      gl,
      {
        src: this.option.url,
        crossOrigin: this.option.crossOrigin,
        minMag: filter,
        flipY: 0
      },
      () => {
        this.loaded = true
        map.triggerRepaint()
      }
    )
  }

  private getMaskBufferInfo(gl: WebGLRenderingContext, data: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
    let positions: number[] = []
    let triangles: number[] = []
    if (data.type === 'MultiPolygon') {
      // type: 'MultiPolygon'
      const polyCount = data.coordinates.length
      let triangleStartIndex = 0
      for (let i = 0; i < polyCount; i++) {
        const coordinates = data.coordinates[i]
        const flattened = flatten(coordinates)
        const { vertices, holes, dimensions } = flattened
        const triangle = earcut(vertices, holes, dimensions)
        const triangleNew = triangle.map((item) => item + triangleStartIndex)

        triangleStartIndex += vertices.length / 2
        // positions.push(...vertices)
        // triangles.push(...triangleNew)
        for (let m = 0; m < vertices.length; m++) {
          positions.push(vertices[m])
        }
        for (let n = 0; n < triangleNew.length; n++) {
          triangles.push(triangleNew[n])
        }
      }
    } else {
      // type: 'Polygon'
      const flattened = flatten(data.coordinates)
      const { vertices, holes, dimensions } = flattened
      positions = vertices
      triangles = earcut(vertices, holes, dimensions)
    }

    return twgl.createBufferInfoFromArrays(gl, {
      a_pos: { numComponents: 2, data: positions },
      indices: triangles.length / 3 > 65535 ? new Uint32Array(triangles) : new Uint16Array(triangles)
    })
  }
}

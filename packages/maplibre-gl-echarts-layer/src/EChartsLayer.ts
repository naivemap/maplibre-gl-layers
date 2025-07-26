import {
  init,
  registerCoordinateSystem,
  getCoordinateSystemDimensions,
  ComposeOption,
  EffectScatterSeriesOption,
  LegendComponentOption,
  LinesSeriesOption,
  ScatterSeriesOption,
  TitleComponentOption,
  TooltipComponentOption
} from 'echarts'
import maplibregl from 'maplibre-gl'

/**
 * A composite type for ECharts options used by the EChartsLayer.
 * It includes common components and series types like Lines and Scatter.
 */
export type ECOption = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | LinesSeriesOption
  | ScatterSeriesOption
  | EffectScatterSeriesOption
>
const COORDINATE_SYSTEM_NAME = 'maplibregl-echarts'

class CoordinateSystem {
  id: string
  dimensions = ['x', 'y']
  private _map: maplibregl.Map
  private _mapOffset = [0, 0]

  constructor(id: string, map: maplibregl.Map) {
    this.id = id
    this._map = map
  }

  create(ecModel: any) {
    ecModel.eachSeries((seriesModel: any) => {
      if (seriesModel.get('coordinateSystem') === this.id) {
        seriesModel.coordinateSystem = new CoordinateSystem(this.id, this._map)
      }
    })
  }

  dataToPoint(data: [number, number]) {
    const px = this._map.project(data)
    const mapOffset = this._mapOffset

    return [px.x - mapOffset[0], px.y - mapOffset[1]]
  }

  pointToData(pt: [number, number]) {
    const mapOffset = this._mapOffset
    const data = this._map.unproject([pt[0] + mapOffset[0], pt[1] + mapOffset[1]])
    return [data.lng, data.lat]
  }

  // setMapOffset(mapOffset: number[]) {
  //   this._mapOffset = mapOffset
  // }

  // getViewRect() {
  //   const canvas = this.map.getCanvas()
  //   return new echarts.graphic.BoundingRect(0, 0, canvas.width, canvas.height)
  // }

  // getRoamTransform() {
  //   return echarts.matrix.create()
  // }

  // getDimensionsInfo() {
  //   return this.dimensions
  // }
}

/**
 * A custom MapLibre GL JS layer that renders Apache ECharts visualizations.
 *
 * @remarks
 * This layer integrates ECharts by creating a dedicated canvas over the map,
 * allowing for rich data visualizations using ECharts' powerful charting capabilities.
 * It is optimized for `lines` and `scatter` series types to visualize flows,
 * trajectories, and point distributions.
 *
 * The layer automatically synchronizes the ECharts view with the map's panning and zooming.
 *
 * @example
 * ```ts
 * import EChartsLayer from '@naivemap/maplibre-gl-echarts-layer';
 *
 * // 1. Define a standard ECharts option object.
 * const option = {
 *   series: [{
 *     type: 'scatter',
 *     name: 'Cities',
 *     data: [
 *       // Data format: [longitude, latitude]
 *       [-74.0060, 40.7128],
 *       [-0.1278, 51.5074],
 *       [139.6917, 35.6895]
 *     ],
 *     symbolSize: 10,
 *   }]
 * };
 *
 * // 2. Create the layer instance
 * const layer = new EChartsLayer('echarts-layer', option);
 *
 * // 3. Add the layer to the map
 * map.addLayer(layer);
 * ```
 */
export default class EChartsLayer implements maplibregl.CustomLayerInterface {
  id: string
  /**
   * @ignore
   */
  type: 'custom'
  /**
   * @ignore
   */
  renderingMode?: '2d' | '3d' | undefined
  private _container!: HTMLDivElement
  private _map!: maplibregl.Map
  private _ec: echarts.ECharts | undefined
  private _coordSystemName: string
  private _ecOption: ECOption

  /**
   * @param id - A unique layer id
   * @param ecOption - The ECharts option object used to configure the visualization.
   * @see https://echarts.apache.org/en/option.html
   */
  constructor(id: string, ecOption: ECOption) {
    this.id = id
    this.type = 'custom'
    this.renderingMode = '2d'
    this._coordSystemName = COORDINATE_SYSTEM_NAME + '-' + Math.random().toString(16).substring(2)
    this._ecOption = ecOption
  }

  /**
   * @ignore
   */
  onAdd(map: maplibregl.Map) {
    this._map = map
    this._createLayerContainer()
    if (!getCoordinateSystemDimensions(this._coordSystemName)) {
      const coordinateSystem = new CoordinateSystem(this._coordSystemName, this._map)
      registerCoordinateSystem(this._coordSystemName, coordinateSystem as any)
    }
  }

  /**
   * @ignore
   */
  onRemove() {
    this._ec?.dispose()
    this._removeLayerContainer()
  }

  /**
   * Updates the ECharts visualization with a new configuration.
   * This is the primary method for dynamically changing the displayed data or styles.
   *
   * @param option - The new ECharts option object to apply.
   * @param notMerge - If true, the new options will completely replace the existing ones.
   *                   If false or undefined, the new options will be merged with the old ones.
   *                   Defaults to `false`.
   * @see https://echarts.apache.org/en/api.html#echartsInstance.setOption
   */
  setOption(option: ECOption, notMerge?: boolean) {
    this._ec?.setOption(option, notMerge)
  }

  /**
   * @ignore
   */
  render() {
    if (!this._container) {
      this._createLayerContainer()
    }
    if (!this._ec) {
      this._ec = init(this._container)
      this._prepareECharts()
      this._ec.setOption(this._ecOption)
    } else {
      if (this._map.isMoving()) {
        this._ec.clear()
      } else {
        this._ec.resize({
          width: this._map.getCanvas().width,
          height: this._map.getCanvas().height
        })
        this._ec.setOption(this._ecOption)
      }
    }
  }

  /**
   * @ignore
   */
  private _prepareECharts() {
    const series = this._ecOption.series as any[]
    if (series) {
      for (let i = series.length - 1; i >= 0; i--) {
        // change coordinateSystem to maplibregl-echarts
        series[i]['coordinateSystem'] = this._coordSystemName
        // disable update animations
        // series[i]['animation'] = false
      }
    }
  }

  /**
   * @ignore
   */
  private _createLayerContainer() {
    const mapContainer = this._map.getCanvasContainer()
    this._container = document.createElement('div')
    this._container.style.width = this._map.getCanvas().style.width
    this._container.style.height = this._map.getCanvas().style.height
    mapContainer.appendChild(this._container)
  }

  /**
   * @ignore
   */
  private _removeLayerContainer() {
    if (this._container) {
      this._container.parentNode?.removeChild(this._container)
    }
  }
}

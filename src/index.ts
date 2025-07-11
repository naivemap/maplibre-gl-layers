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
  TooltipComponentOption,
} from 'echarts'
import maplibregl from 'maplibre-gl'

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
 * EChartsLayer is a custom layer for MapLibre GL that integrates ECharts.
 */
export default class EChartsLayer implements maplibregl.CustomLayerInterface {
  id: string
  type: 'custom'
  renderingMode?: '2d' | '3d' | undefined
  private _container!: HTMLDivElement
  private _map!: maplibregl.Map
  private _ec: echarts.ECharts | undefined
  private _coordSystemName: string
  private _ecOption: ECOption

  constructor(id: string, ecOption: ECOption) {
    this.id = id
    this.type = 'custom'
    this.renderingMode = '2d'
    this._coordSystemName = COORDINATE_SYSTEM_NAME + '-' + Math.random().toString(16).substring(2)
    this._ecOption = ecOption
  }

  onAdd(map: maplibregl.Map) {
    this._map = map
    this._createLayerContainer()
    if (!getCoordinateSystemDimensions(this._coordSystemName)) {
      const coordinateSystem = new CoordinateSystem(this._coordSystemName, this._map)
      registerCoordinateSystem(this._coordSystemName, coordinateSystem as any)
    }
  }

  onRemove() {
    this._ec?.dispose()
    this._removeLayerContainer()
  }

  setOption(option: ECOption) {
    this._ec?.setOption(option)
  }

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
          height: this._map.getCanvas().height,
        })
        this._ec.setOption(this._ecOption)
      }
    }
  }

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

  private _createLayerContainer() {
    const mapContainer = this._map.getCanvasContainer()
    this._container = document.createElement('div')
    this._container.style.width = this._map.getCanvas().style.width
    this._container.style.height = this._map.getCanvas().style.height
    mapContainer.appendChild(this._container)
  }

  private _removeLayerContainer() {
    if (this._container) {
      this._container.parentNode?.removeChild(this._container)
    }
  }
}

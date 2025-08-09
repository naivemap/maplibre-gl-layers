import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ImageLayer from '../packages/maplibre-gl-image-layer/src'

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://www.naivemap.com/demotiles/style.json',
  hash: true,
  bounds: [
    [105.289838, 32.204171],
    [110.195632, 28.164713]
  ],
  fitBoundsOptions: {
    padding: { top: 10, bottom: 10, left: 10, right: 10 }
  }
})

map.on('load', () => {
  const layer = new ImageLayer('image-layer', {
    url: 'https://www.naivemap.com/mapbox-gl-js-cookbook/assets/images/4326.png',
    projection: 'EPSG:4326',
    coordinates: [
      [105.289838, 32.204171],
      [110.195632, 32.204171],
      [110.195632, 28.164713],
      [105.289838, 28.164713]
    ]
  })

  map.addLayer(layer)
})

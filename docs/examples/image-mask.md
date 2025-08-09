
# Georeferenced Image with Mask

      property="og:description"

<iframe src="/maplibre-gl-layers/demos/image-mask.html" width="100%" style="border:none; height:400px"></iframe>

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Georeferenced Image with Mask</title>
    <meta
      property="og:description"
      content="Display a georeferenced image with a polygon mask to show only a specific area."
    />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
    <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
    <script src="https://unpkg.com/proj4"></script>
    <script src="https://unpkg.com/@naivemap/maplibre-gl-image-layer"></script>
    <script src="https://unpkg.com/tweakpane@3.1.4"></script>
    <link rel="stylesheet" href="./style.css" />
  </head>

  <body>
    <div id="map"></div>
    <script>
      // const pane = new Tweakpane.Pane()
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://www.naivemap.com/demotiles/style.json',
        bounds: [
          [105.29197, 32.20291],
          [110.19401, 28.16587]
        ],
        fitBoundsOptions: {
          padding: { top: 10, bottom: 10, left: 10, right: 10 }
        }
      })
      map.on('load', () => {
        const layer4326 = new ImageLayer('image-layer', {
          url: './images/Terrain_CQ.jpeg',
          projection: 'EPSG:4326',
          coordinates: [
            [105.29197, 32.20291],
            [110.19401, 32.20291],
            [110.19401, 28.16587],
            [105.29197, 28.16587]
          ],
          mask: {
            data: './data/chongqing.geojson'
          }
        })

        map.addLayer(layer4326)
      })
    </script>
  </body>
</html>

```

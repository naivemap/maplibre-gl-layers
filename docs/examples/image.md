
# Georeferenced Image with EPSG:4326

Display an image with a custom projection (e.g., EPSG:4326).

<iframe src="/maplibre-gl-layers/demos/image.html" width="100%" style="border:none; height:400px"></iframe>

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Georeferenced Image with EPSG:4326</title>
    <meta property="og:description" content="Display an image with a custom projection (e.g., EPSG:4326)." />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
    <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
    <script src="https://unpkg.com/@naivemap/maplibre-gl-image-layer"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
      }

      #map {
        height: 400px;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>
    <script>
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://www.naivemap.com/demotiles/style.json',
        bounds: [
          [105.289838, 32.204171],
          [110.195632, 28.164713]
        ],
        fitBoundsOptions: {
          padding: { top: 10, bottom: 10, left: 10, right: 10 }
        }
      })
      map.on('load', () => {
        const layer4326 = new ImageLayer('image-layer', {
          url: './images/Terrain_CQ.png',
          projection: 'EPSG:4326',
          coordinates: [
            [105.289838, 32.204171], // top-left
            [110.195632, 32.204171], // top-right
            [110.195632, 28.164713], // bottom-right
            [105.289838, 28.164713] // bottom-left
          ]
        })

        map.addLayer(layer4326)
      })
    </script>
  </body>
</html>

```

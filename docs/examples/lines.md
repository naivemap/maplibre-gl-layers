
# 显示地图

使用 MapLibre GL JS 在 HTML 元素中初始化地图。

<iframe src="/maplibre-gl-echarts-layer/demos/lines.html" width="100%" style="border:none; height:400px"></iframe>

```html
<!doctype html>
<html lang="zh-Hans">
  <head>
    <title>显示地图</title>
    <meta property="og:description" content="使用 MapLibre GL JS 在 HTML 元素中初始化地图。" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
    <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
    <script src="./index.umd.cjs"></script>
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
        container: 'map', // 地图容器 id
        style: 'https://www.naivemap.com/demotiles/style.json', // 样式 URL
        center: [104.294538, 35.860092], // 地图初始中心点 [经度, 维度]
        zoom: 2 // 地图初始缩放级别
      })
    </script>
  </body>
</html>

```

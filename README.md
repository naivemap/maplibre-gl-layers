# MapLibre GL JS Custom Layers

A collection of custom layer implementations for MapLibre GL JS, designed to extend its visualization capabilities.

**[Live Demos & Documentation](https://naivemap.github.io/maplibre-gl-layers/)**

---

## Packages

This monorepo contains the following packages:

| Package | NPM Version | License | Description |
| --- | --- | --- | --- |
| **`@naivemap/maplibre-gl-echarts-layer`** | [![npm](https://img.shields.io/npm/v/@naivemap/maplibre-gl-echarts-layer.svg)](https://www.npmjs.com/package/@naivemap/maplibre-gl-echarts-layer) | [![license](https://img.shields.io/npm/l/@naivemap/maplibre-gl-echarts-layer.svg)](https://github.com/naivemap/maplibre-gl-layers/blob/main/LICENSE) | Integrates Apache ECharts (`lines` and `scatter` charts) as a high-performance layer in MapLibre GL JS. |
| **`@naivemap/maplibre-gl-image-layer`** | [![npm](https://img.shields.io/npm/v/@naivemap/maplibre-gl-image-layer.svg)](https://www.npmjs.com/package/@naivemap/maplibre-gl-image-layer) | [![license](https://img.shields.io/npm/l/@naivemap/maplibre-gl-image-layer.svg)](https://github.com/naivemap/maplibre-gl-layers/blob/main/LICENSE) | A versatile layer for displaying georeferenced images with various projections (using `proj4js`) on the map. |

## Getting Started

### Installation

Install the desired package using your favorite package manager:

```bash
# Install EChartsLayer
pnpm add @naivemap/maplibre-gl-echarts-layer echarts maplibre-gl

# Install ImageLayer
pnpm add @naivemap/maplibre-gl-image-layer proj4 maplibre-gl
```

### Quick Usage Example (`EChartsLayer`)

Here is a quick example of how to use the `@naivemap/maplibre-gl-echarts-layer`.

```javascript
import { Map } from 'maplibre-gl'
import EChartsLayer from '@naivemap/maplibre-gl-echarts-layer'

// 1. Initialize the map
const map = new Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 1
})

// 2. Define your ECharts options
const option = {
  series: [
    {
      type: 'scatter',
      name: 'Cities',
      data: [
        { name: 'New York', value: [-74.006, 40.7128] },
        { name: 'London', value: [-0.1278, 51.5074] },
        { name: 'Tokyo', value: [139.6917, 35.6895] }
      ],
      symbolSize: 10
    }
  ]
}

// 3. Add the layer to the map
map.on('load', () => {
  const layer = new EChartsLayer('echarts-layer', option)
  map.addLayer(layer)
})
```

For more detailed examples and API documentation, please visit our **[documentation site](https://naivemap.github.io/maplibre-gl-layers/)**.

## Development

This project is a monorepo managed by pnpm.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/naivemap/maplibre-gl-layers.git
    cd maplibre-gl-layers
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run the development server for documentation:** This command will build the packages, generate TypeDoc documentation, and start the VitePress development server.

    ```bash
    pnpm docs:dev
    ```

4.  **Build all packages:**
    ```bash
    pnpm build
    ```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/naivemap/maplibre-gl-layers/blob/main/LICENSE) file for details.

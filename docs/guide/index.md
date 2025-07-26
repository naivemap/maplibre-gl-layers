# Guide

This repository provides a collection of custom layer implementations for MapLibre GL JS, designed to extend its visualization capabilities.

## Introduction

EChartsLayer ([@naivemap/maplibre-gl-echarts-layer](https://www.npmjs.com/package/@naivemap/maplibre-gl-echarts-layer)): Integrates Apache ECharts with MapLibre GL JS, specifically enabling the use of **Lines graphs** and **Scatter (bubble)** charts as a map layer. This allows for visualizing connections, paths, and point-based data with the rich styling capabilities of ECharts.

ImageLayer ([@naivemap/maplibre-gl-image-layer](https://www.npmjs.com/package/@naivemap/maplibre-gl-image-layer)): A versatile layer for displaying georeferenced images with **various projections** on the map. It supports loading and correctly positioning images from different coordinate systems, making it ideal for integrating non-standard raster data, historical maps, or aerial imagery.

## Getting Started

### [EChartsLayer](../api/echarts-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/maplibre-gl-echarts-layer
```

```sh [npm]
$ npm add @naivemap/maplibre-gl-echarts-layer
```

```sh [yarn]
$ yarn add @naivemap/maplibre-gl-echarts-layer
```

:::

### Usage

```ts
import EChartsLayer from '@naivemap/maplibre-gl-echarts-layer'

const layer = new EChartsLayer('echarts-layer', option)
map.addLayer(layer)
```

### [ImageLayer](../api/image-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/maplibre-gl-image-layer
```

```sh [npm]
$ npm add @naivemap/maplibre-gl-image-layer
```

```sh [yarn]
$ yarn add @naivemap/maplibre-gl-image-layer
```

:::

### Usage

```ts
import ImageLayer from '@naivemap/maplibre-gl-image-layer'

const layer = new ImageLayer('image-layer', option)
map.addLayer(layer)
```

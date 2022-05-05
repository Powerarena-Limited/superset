## @superset-ui/plugin-chart-distplot

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-distplot.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-distplot)

This plugin provides Distplot for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import DistplotChartPlugin from '@superset-ui/plugin-chart-distplot';

new DistplotChartPlugin()
  .configure({ key: 'distplot' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-distplot) for more details.

```js
<SuperChart
  chartType="distplot"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### File structure generated

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── Distplot.tsx
│   ├── images
│   │   └── thumbnail.png
│   ├── index.ts
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── index.ts
│   │   └── transformProps.ts
│   └── types.ts
├── test
│   └── index.test.ts
└── types
    └── external.d.ts
```

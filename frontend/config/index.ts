import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'liuyao-decide',
  date: '2026-05-03',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  alias: {
    '@': require('path').resolve(__dirname, '..', 'src'),
  },
  copy: {
    patterns: [],
  },
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
      },
      url: {
        enable: true,
        config: { limit: 1024 },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
      },
    },
    devServer: {
      port: 10086,
    },
  },
});

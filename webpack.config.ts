import { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import path from 'path';

const config: Configuration = {
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: ['ts-loader'],
      },
    ],
  },
  plugins: [new ESLintPlugin()],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devtool: 'source-map',
  target: ['web', 'es5'],
  mode: 'production',
  entry: './src/index.ts',
  output: {
    library: 'VanillaRecyclerView',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.resolve(__dirname, './dist/bundle'),
    filename: 'vanilla-recycler-view.min.js',
  },
};

export default config;

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const prod = process.env.NODE_ENV === 'production';

module.exports = {
  mode: 'development',
  entry: prod ? './src/entry.ts' : './src/dev.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: ['ts-loader'],
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    port: 9009,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'vanilla-recycler-view.min.css'
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: 'public/index.html',
    }),
  ],
  output: {
    library: 'VanillaRecyclerView',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
    filename: 'vanilla-recycler-view.min.js'
  },
  devtool: false,
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin(),
    ],
  },
};

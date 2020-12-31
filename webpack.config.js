const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const prod = process.env.NODE_ENV === 'production';
console.log(prod);

module.exports = {
  mode: 'development',
  entry: prod ? './src/entry.ts' : './src/dev.ts',
  devtool: 'inline-source-map',
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
};

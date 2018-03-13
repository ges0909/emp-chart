const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// assets.js
const Assets = require('./assets');

module.exports = {
  context: path.resolve(__dirname, 'src'), // __dirname refers to the directory where' webpack.config.js' lives
  entry: {
    // use relative pathes only
    chart: './js/chart.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
    // filename: 'emp.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use:  ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin(
      Assets.map(asset => {
        return {
          from: path.resolve(__dirname, `./node_modules/${asset}`),
          to: path.resolve(__dirname, 'dist/ext')
        };
      })
    )
  ]
};
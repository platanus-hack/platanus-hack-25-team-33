const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const CopyPlugin = require("copy-webpack-plugin")
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin")
const WorkboxPlugin = require("workbox-webpack-plugin")

module.exports = merge(common, {
  mode: "production",
  optimization: {
    concatenateModules: false,
    splitChunks: {
      chunks: "all",
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public/*.svg", to: "[name][ext]" },
        { from: "public/*.png", to: "[name][ext]" },
        { from: "public/*.webmanifest", to: "[name][ext]" },
      ],
    }),
  ],
})

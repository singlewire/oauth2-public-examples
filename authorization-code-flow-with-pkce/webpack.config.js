require("dotenv").config();
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.jsx",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: ["index.html"],
    }),
    new webpack.DefinePlugin({
      INFORMACAST_URI: JSON.stringify(process.env.INFORMACAST_URI),
      CLIENT_ID: JSON.stringify(process.env.CLIENT_ID),
    }),
  ],
  devServer: {
    proxy: {
      "/api": "https://localhost:8080",
    },
    historyApiFallback: true,
  },
};

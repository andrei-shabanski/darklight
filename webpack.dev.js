const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/js/index.js",
  output: {
    filename: "app.bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  devServer: {
    contentBase: "./dist",
    historyApiFallback: {
      rewrites: [
        { from: /^\/policy/, to: '/policy.html' },
        { from: /^\/terms/, to: '/terms.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html"
    }),
    new HtmlWebpackPlugin({
      filename: "policy.html",
      template: "src/policy.html"
    }),
    new HtmlWebpackPlugin({
      filename: "terms.html",
      template: "src/terms.html"
    }),
  ]
};

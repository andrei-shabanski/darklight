const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/js/index.js",
  output: {
    filename: "js/app.bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  devServer: {
    contentBase: "./dist",
    historyApiFallback: {
      rewrites: [
        { from: /^\/policy/, to: "/policy.html" },
        { from: /^\/terms/, to: "/terms.html" },
        { from: /./, to: "/index.html" }
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
          presets: [
            "@babel/preset-env", {
              'plugins': ['@babel/plugin-proposal-class-properties']
          }]
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images/"
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              disable: true,
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enabled: true
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
              webp: {
                quality: 75
              }
            }
          }
        ]
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
    })
  ]
};

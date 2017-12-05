const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssets = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const VENDOR = ["react", "react-dom"];
const PATH = {
  public: path.resolve(__dirname, "./public"),
  public_html: path.resolve(__dirname, "./public/index.html"),
  assets: {
    images: path.resolve(__dirname, "src/assets/images")
  },
  exclude: /node_modules/
};

const config = {
  entry: {
    vendor: VENDOR,
    app: "./src/index.js"
  },
  output: {
    path: PATH.public, // ouput path
    filename: "[name].[hash].js"
  },
  resolve: {
    // These options change how modules are resolved
    extensions: [
      ".js",
      ".jsx",
      ".json",
      ".scss",
      ".css",
      ".jpeg",
      ".jpg",
      ".gif",
      ".png"
    ], // Automatically resolve certain extensions
    alias: {
      // Create aliases
      images: PATH.assets.images
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/, // files ending with .js
        exclude: PATH.exclude,
        loader: "babel-loader" // use this (babel-core) loader
      },
      {
        test: /\.scss$/, // files ending with .scss
        use: ["css-hot-loader"].concat(
          ExtractTextWebpackPlugin.extract({
            // HMR for styles
            fallback: "style-loader",
            use: ["css-loader", "sass-loader", "postcss-loader"]
          })
        )
      },
      {
        test: /\.jsx$/, // all files ending with .jsx
        loader: "babel-loader", // use the babel-loader for all .jsx files
        exclude: PATH.exclude
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          "file-loader?context=src/assets/images/&name=images/[path][name].[ext]",
          {
            // images loader
            loader: "image-webpack-loader",
            query: {
              mozjpeg: {
                progressive: true
              },
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 4
              },
              pngquant: {
                quality: "75-90",
                speed: 3
              }
            }
          }
        ],
        exclude: PATH.exclude,
        include: __dirname
      }
    ] // end rules
  },
  plugins: [
    new ExtractTextWebpackPlugin("[name].css"), // call the ExtractTextWebpackPlugin constructor and name our css file
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: true,
      minChunks: 2
    }),
    new HtmlWebpackPlugin({
      template: PATH.public_html,
      hash: true,
      chunks: ["vendor", "app"],
      chunksSortMode: "manual",
      filename: "index.html",
      inject: "body"
    })
  ],
  devServer: {
    contentBase: PATH.public, // A directory or URL to serve HTML content from.
    historyApiFallback: true, // fallback to /index.html for Single Page Applications.
    inline: true, // inline mode (set to false to disable including client scripts (like livereload)
    open: true // open default browser while launching
  },
  devtool: "eval-source-map" // enable devtool for better debugging experience
};

module.exports = config;

// if production, then we need to add  the rest of plugins
if (process.env.NODE_ENV === "production") {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new OptimizeCSSAssets()
  );
}

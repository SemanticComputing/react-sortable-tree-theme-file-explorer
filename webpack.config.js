const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const target = process.env.TARGET || 'umd';

const styleLoader = {
  loader: 'style-loader',
  // options: { insertAt: 'top' },
};

const fileLoader = {
  loader: 'file-loader',
  options: { name: 'static/[name].[ext]' },
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        [
          "autoprefixer",
          {
            // Options
          },
        ],
      ],
    }
  }
};

const cssLoader = isLocal => ({
  loader: 'css-loader',
  options: {
    modules: {
      mode: 'local',
      localIdentName: isLocal ? 'rstcustom__[local]' : '[hash:base64]',
      // localIdentName: 'rstcustom__[local]',
    },
    importLoaders: 2,
  },
});

const config = {
  entry: './index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ReactSortableTreeThemeFileExplorer',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.scss$/,
        use: [styleLoader, cssLoader(true), postcssLoader, 'sass-loader'],
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        // Used for importing css from external modules (react-virtualized, etc.)
        test: /\.css$/,
        use: [styleLoader, cssLoader(false), postcssLoader],
      },
    ],
  },
};

switch (target) {
  case 'umd':
    // Exclude library dependencies from the bundle
    config.externals = [
      nodeExternals({
        // load non-javascript files with extensions, presumably via loaders
        whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
      }),
    ];
    break;
  case 'development':
    config.devtool = 'eval';
    config.module.rules.push({
      test: /\.(jpe?g|png|gif|ico|svg)$/,
      use: [fileLoader],
      exclude: path.join(__dirname, 'node_modules'),
    });
    config.entry = ['react-hot-loader/patch', './demo/index'];
    config.output = {
      path: path.join(__dirname, 'build'),
      filename: 'static/[name].js',
    };
    config.plugins = [
      new HtmlWebpackPlugin({
        inject: true,
        template: './demo/index.html',
      }),
      new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
      new webpack.NoEmitOnErrorsPlugin(),
    ];
    config.devServer = {
      static: path.join(__dirname, 'build'),
      port: process.env.PORT || 3001
    };

    break;
  case 'demo':
    config.module.rules.push({
      test: /\.(jpe?g|png|gif|ico|svg)$/,
      use: [fileLoader],
      exclude: path.join(__dirname, 'node_modules'),
    });
    config.entry = './demo/index';
    config.output = {
      path: path.join(__dirname, 'build'),
      filename: 'static/[name].js',
    };
    config.plugins = [
      new HtmlWebpackPlugin({
        inject: true,
        template: './demo/index.html',
      }),
      new webpack.EnvironmentPlugin({ NODE_ENV: 'production' }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ];

    break;
  default:
}

module.exports = config;

var path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/main.ts',
  externals: {
      vscode: {
        commonjs: 'vscode',
        commonjs2: 'vscode',
        amd: 'vscode'
      }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'main.js'
  },
  resolve: {
    extensions: [ '.js', '.tsx', '.ts' ],
    modules: [
        "node_modules",
    ],
  },
  target: 'node'
};
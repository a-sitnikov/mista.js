const path = require('path');

module.exports = {
  mode: 'production',
  entry: './user.js',
  output: {
    path: path.resolve(__dirname, ''),
    filename: 'es5_user.js'
  },
  plugins: [
    //empty pluggins array
  ],
  module: {
    rules: [
     {
        test: /.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
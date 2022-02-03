process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: process.env.BASE_URL,
  devServer: {
    disableHostCheck: true
  }
}

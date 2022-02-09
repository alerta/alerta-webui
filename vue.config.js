process.env.VUE_APP_VERSION = require('./package.json').version

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  publicPath: process.env.BASE_URL,
  productionSourceMap: false,
  devServer: {
    disableHostCheck: true,
    public: process.env.APP_HOSTNAME
  }
}

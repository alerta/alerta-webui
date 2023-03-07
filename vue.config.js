process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: process.env.BASE_URL,
  chainWebpack: config => {

    config.module
      .rule('fonts')
      .parser({
        dataUrlCondition: {
          maxSize: 4096
        }
      })
  },
  devServer: {
    allowedHosts: 'all'
  }
}

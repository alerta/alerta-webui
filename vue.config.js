process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: '',
  chainWebpack: config => {
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        name: 'fonts/[name].[ext]'
      })
  },
  devServer: {
    disableHostCheck: true
  }
}

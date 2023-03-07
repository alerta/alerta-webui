process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: process.env.BASE_URL,
  chainWebpack: config => {
    //Remove this when compatibility mode is no longer needed
    config.resolve.alias.set('vue', '@vue/compat')
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        name: 'fonts/[name].[ext]'
      })
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  },
  devServer: {
    disableHostCheck: true
  }
}

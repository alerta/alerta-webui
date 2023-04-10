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
    
    config
      .plugin('define')
      .tap((definitions) => {
        Object.assign(definitions[0], {
          // ... rest of your injected vars here
          // get rid of vue-i18 warning
          __VUE_I18N_FULL_INSTALL__: JSON.stringify(true),
          __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
          __VUE_I18N_LEGACY_API__: JSON.stringify(false),
        })
  
        return definitions
      })
  },

  devServer: {
    allowedHosts: 'all'
  },
}

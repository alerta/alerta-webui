import Vue from 'vue'
import Vuetify from 'vuetify/lib'

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify, {
  icons: {
    iconfont: 'md'
  }
})

const opts = {
  theme: {
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726',
        error: colors.red.accent3,
      },
      dark: {
        primary: colors.blue.lighten3,
      }
    },
    options: {
      cspNonce: '2726c7f26c',
    }
  }
}

export default new Vuetify(opts)

import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify, {
  icons: {
    iconfont: 'md'
  }
})

const opts = {
  theme: {
    dark: true,
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726'
      },
      dark: {
        primary: '#3f51b5',  // FIXME
        secondary: '#2196f3',
        accent: '#ffa726'
      }
    }
  }
}

export default new Vuetify(opts)

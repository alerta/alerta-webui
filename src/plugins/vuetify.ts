import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
  theme: {
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726'
      }
    }
  },
  icons: {
    iconfont: 'md'
  }
}

export default new Vuetify(opts)

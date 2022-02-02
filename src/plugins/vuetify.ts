import Vue from 'vue'
import Vuetify, { UserVuetifyPreset } from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

const opts: Partial<UserVuetifyPreset> = {
  themes: {
    light: {
      primary: '#3f51b5',
      secondary: '#2196f3',
      accent: '#ffa726'
    }
  },
  icons: {
    iconfont: 'md'
  }
}

Vue.use(Vuetify)

export default new Vuetify(opts)

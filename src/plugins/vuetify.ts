import '@mdi/font/css/materialdesignicons.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

export default new Vuetify({
  themes: {
    light: {
      primary: '#3f51b5',
      secondary: '#2196f3',
      accent: '#ffa726'
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})

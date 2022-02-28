import '@mdi/font/css/materialdesignicons.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726'
      },

      dark: {
        primary: '#5462b0',
        secondary: '#2196f3',
        accent: '#ffa726'
      }
    }
  }
})

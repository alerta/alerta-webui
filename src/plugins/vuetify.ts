import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726'
      },
      dark: {
        primary: '#3f51b5',
        secondary: '#2196f3',
        accent: '#ffa726'
      }
    }
  },
  icons: {
    iconfont: 'md',
  },
})

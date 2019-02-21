import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  theme: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  },
  iconfont: 'md'
})

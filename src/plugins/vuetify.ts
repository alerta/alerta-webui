import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

import 'vuetify/src/styles/main.sass'

import app from '@/main'

app.use(Vuetify, {
  theme: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  },
  iconfont: 'md'
})

import { createVuetify } from 'vuetify'

import 'vuetify/lib/styles/main.sass'

import app from '@/main'
//TODO: Does createVuetify need options?
const vuetify = createVuetify()

app.use(vuetify, {
  theme: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  },
  iconfont: 'md'
})

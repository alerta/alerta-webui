import {createVuetify} from 'vuetify'
import {md} from 'vuetify/iconsets/md'
import 'vuetify/lib/styles/main.sass'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
//This will make the final bundle bigger because
//of possibly unused components

//These components no longer exist in vuetify 3:
/*
v-flex
v-content
*/
const customTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      customTheme
    }
  },
  icons: {
    defaultSet: 'md',
    sets: {
      md
    }
  }
})

export default vuetify

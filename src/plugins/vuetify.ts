import {createVuetify} from 'vuetify'
import {aliases,md} from 'vuetify/iconsets/md'
import 'vuetify/lib/styles/main.sass'
import 'vuetify/styles'
import * as comps from 'vuetify/components'
//WARNING: This will not be supported in the future
import *  as labComps from 'vuetify/labs/VDataTable'
import * as directives from 'vuetify/directives'
//This will make the final bundle bigger because
//of possibly unused components
const customTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  }
}

const vuetify = createVuetify({
  directives,
  components: {
    ...comps,
    ...labComps
  },
  theme: {
    themes: {
      customTheme
    }
  },
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md
    }
  },
  defaults: {
    global: {
      attach: '#app'
    }
  }
})

export default vuetify

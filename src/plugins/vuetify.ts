import { createVuetify } from 'vuetify'
import { md } from 'vuetify/iconsets/md'
import 'vuetify/lib/styles/main.sass'

//This will make the final bundle bigger because
//of possibly unused components
import * as components from 'vuetify/components'

//These components no longer exist in vuetify 3:
/*
v-toolbar-side-icon
v-list-tile-action
v-list-tile-title
v-list-tile-content
v-list-tile
v-subheader
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

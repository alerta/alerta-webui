import { createVuetify } from 'vuetify'
import { md } from 'vuetify/iconsets/md'
import 'vuetify/lib/styles/main.sass'


const customTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#2196f3',
    accent: '#ffa726'
  }
}

const vuetify = createVuetify({ 
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

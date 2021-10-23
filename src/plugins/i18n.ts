import Vue from 'vue'
import VueI18n from 'vue-i18n'

// import file language from @/locales
import { en } from '@/locales/en'
import { fr } from '@/locales/fr'
import { de } from '@/locales/de'
import { tr } from '@/locales/tr'

Vue.use(VueI18n)

const loadLocaleMessages = {
  en,
  fr,
  de,
  tr
}

// variable navigator language
let language = (navigator.languages && navigator.languages[0]) || navigator.language

if (language.length > 2) {
  language = language.split('-')[0]
  language = language.split('_')[0]
}

// variable i18n for translation
const i18n = new VueI18n({
  locale: language,
  fallbackLocale: 'en', // set fallback locale
  messages: loadLocaleMessages
})
  
export default i18n
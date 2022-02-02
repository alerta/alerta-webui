import Vue from 'vue'

export default Vue.filter('shortId', (value) => {
  if (value) return String(value).substring(0, 8)
})

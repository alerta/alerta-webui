import Vue from 'vue'

// See https://vuejs.org/v2/guide/filters.html

export default Vue.filter('capitalize', (value) => {
  if (value == null) return ''

  const words: string[] = value.toString().split(' ')
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

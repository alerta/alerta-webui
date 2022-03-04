import Vue from 'vue'

export default Vue.filter('splitCaps', (value) => {
  if (!value) return ''
  return value
    .toString()
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

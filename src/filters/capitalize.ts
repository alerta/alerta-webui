import Vue from 'vue'

// See https://vuejs.org/v2/guide/filters.html

export default Vue.filter('capitalize', function(value) {
  if (value == null) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

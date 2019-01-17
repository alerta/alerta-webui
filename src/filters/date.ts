import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('date', function(value, format = 'll') {
  if (value) {
    return moment
      .utc(String(value))
      .local()
      .format(format)
  }
})

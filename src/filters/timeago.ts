import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('timeago', function (value) {
  if (value) {
    return moment(String(value)).fromNow()
  }
})

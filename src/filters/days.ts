import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('days', function (value) {
  function pad(s) {
    return ('0' + s).slice(-2)
  }
  if (value) {
    let duration = moment.duration(value, 'seconds')
    var seconds = pad(duration.seconds())
    var minutes = pad(duration.minutes())
    var hours = pad(duration.hours())
    var days = Math.floor(duration.as('d'))
    return `${days} days ${hours}:${minutes}:${seconds}`
  }
})

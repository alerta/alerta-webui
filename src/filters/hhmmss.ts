import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('hhmmss', function (value) {
  function pad(s) {
    return `0${s}`.slice(-2)
  }
  if (value) {
    const duration = moment.duration(value, 'seconds')
    const seconds = pad(duration.seconds())
    const minutes = pad(duration.minutes())
    const hours = Math.floor(duration.as('h'))
    return `${hours}:${minutes}:${seconds}`
  }
})

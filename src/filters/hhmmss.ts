import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('hhmmss', (value?: moment.DurationInputArg1) => {
  const pad = (s: number) => `0${s}`.slice(-2)

  if (!value) return
  const duration = moment.duration(value, 'seconds')
  const seconds = pad(duration.seconds())
  const minutes = pad(duration.minutes())
  const hours = Math.floor(duration.as('h'))
  return `${hours}:${minutes}:${seconds}`
})

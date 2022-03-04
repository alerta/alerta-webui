import moment from 'moment'
import Vue from 'vue'

export default Vue.filter('days', (value?: moment.DurationInputArg1) => {
  const pad = (s: number) => `0${s}`.slice(-2)

  if (!value) return
  const duration = moment.duration(value, 'seconds')
  const seconds = pad(duration.seconds())
  const minutes = pad(duration.minutes())
  const hours = pad(duration.hours())
  const days = Math.floor(duration.as('d'))
  return `${days} days ${hours}:${minutes}:${seconds}`
})

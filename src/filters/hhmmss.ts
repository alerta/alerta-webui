import moment from 'moment'

export default function (value) {
  function pad(s) {
    return ('0' + s).slice(-2)
  }
  if (value) {
    let duration = moment.duration(value, 'seconds')
    let seconds = pad(duration.seconds())
    let minutes = pad(duration.minutes())
    let hours = Math.floor(duration.as('h'))
    return `${hours}:${minutes}:${seconds}`
  }
}

import moment from 'moment'

export default function (value, mode = 'local', format = 'll') {
  if (value) {
    if (mode === 'utc') {
      return moment.utc(String(value)).format(format)
    } else {
      return moment.utc(String(value)).local().format(format)
    }
  }
}

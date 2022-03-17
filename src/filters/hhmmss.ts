import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.filter('hhmmss', (value?: string | DateTime) => {
  if (!value) return

  return DateTime.now()
    .diff(
      typeof value === 'string' ? DateTime.fromISO(value) : value,
      'seconds'
    )
    .toFormat('hh:mm:ss')
})

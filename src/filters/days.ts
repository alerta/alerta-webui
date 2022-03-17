import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.filter('days', (value?: string | number) => {
  if (!value) return

  const duration = DateTime.now().diff(
    typeof value === 'string'
      ? DateTime.fromISO(value)
      : DateTime.fromMillis(value),
    'seconds'
  )
  return duration.toFormat(`d 'days' hh:mm:ss`)
})

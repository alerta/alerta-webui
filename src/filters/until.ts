import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.filter('until', (value?: string) => {
  if (value) return DateTime.fromISO(value).toRelative()
})

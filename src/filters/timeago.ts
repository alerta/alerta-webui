import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.filter('timeago', (value?: string) => {
  if (value) return DateTime.fromISO(value).toRelative()
})

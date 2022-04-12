import { DateTime, StringUnitLength } from 'luxon'
import Vue from 'vue'

export default Vue.filter(
  'timeago',
  (value?: string, style: StringUnitLength | undefined = undefined) => {
    if (value) return DateTime.fromISO(value).toRelative({ style })
  }
)

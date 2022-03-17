import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.filter(
  'date',
  (
    value?: string,
    mode = 'local',
    format: string | Intl.DateTimeFormatOptions = 'll'
  ) => {
    if (!value) return

    const date = DateTime.fromISO(value)
    if (typeof format === 'string') {
      return date.toFormat(format, {
        locale:
          mode === 'utc'
            ? 'utc'
            : (navigator.languages && navigator.languages[0]) ||
              navigator.language
      })
    }

    return date.toLocaleString(format)
  }
)

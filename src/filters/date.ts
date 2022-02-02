import moment from 'moment'
import Vue from 'vue'

export default Vue.filter(
  'date',
  function (value, mode = 'local', format = 'll') {
    if (value) {
      if (mode === 'utc') {
        return moment.utc(String(value)).format(format)
      } else {
        return moment.utc(String(value)).local().format(format)
      }
    }
  }
)

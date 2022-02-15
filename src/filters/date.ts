import moment from 'moment'
import Vue from 'vue'

export default Vue.filter(
  'date',
  (value: moment.MomentInput, mode = 'local', format = 'll') => {
    if (!value) return
    return moment(value)[mode === 'utc' ? 'utc' : 'local']().format(format)
  }
)

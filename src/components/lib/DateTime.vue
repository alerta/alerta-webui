<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on" class="text-no-wrap">
        {{ value | date(displayMode, formatString) }}
      </span>
    </template>
    <span>{{ value | date('utc', 'YYYY/MM/DD HH:mm:ss.SSS Z') }}</span>
  </v-tooltip>
</template>

<script>
import moment from 'moment'
import i18n from '@/plugins/i18n'
moment.locale(i18n.locale)

export default {
  props: {
    value: { type: String, required: true },
    format: { type: String, default: 'mediumDate' }
  },
  computed: {
    displayMode() {
      return this.$store.state.prefs.timezone
    },
    formatString() {
      return (
        this.$store.state.prefs.dates[this.format] ||
        this.$config.dates[this.format]
      )
    }
  }
}
</script>

<style></style>

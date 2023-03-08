<template>
  <v-tooltip top>
    <template #activator="{props}">
      <span
        v-bind="props"
        class="text-no-wrap"
      >
        {{ $filters.date(value, displayMode, formatString) }}
      </span>
    </template>
    <span>{{ $filters.date(value, 'utc', 'YYYY/MM/DD HH:mm:ss.SSS Z') }}</span>
  </v-tooltip>
</template>

<script>

import moment from 'moment'
import i18n from '@/plugins/i18n'
moment.locale(i18n.global.locale.value)

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

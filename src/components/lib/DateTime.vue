<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on" class="text-no-wrap">
        {{ value | date(displayMode, formatString) }}
      </span>
    </template>
    <span>{{ value | date('utc', dateFormat) }}</span>
  </v-tooltip>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    value: { type: String, required: true },
    format: { type: String, default: 'mediumDate' }
  },
  data: () => ({
    dateFormat: DateTime.DATETIME_SHORT
  }),
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

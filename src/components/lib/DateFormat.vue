<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on" :class="`text-no-wrap`">
        {{ value | date(displayMode, formatString) }}
      </span>
    </template>
    <span>{{ value | date('utc', dateFormat) }}</span>
  </v-tooltip>
</template>

<script lang='ts'>
import { DateTime } from 'luxon'
import Vue from 'vue'

export default Vue.extend({
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
})
</script>


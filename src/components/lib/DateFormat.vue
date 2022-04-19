<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on" class="w-max">
        <slot v-bind:on="on">
          <template v-if="relative">
            {{ value | timeago(relativeStyle) }}
          </template>
          <template v-else>
            {{ value | date(displayMode, formatString) }}
          </template>
        </slot>
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
    format: { type: String, default: 'mediumDate' },
    relative: { type: [Boolean, String], default: false }
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
        // @ts-ignore
        this.$config.dates[this.format]
      )
    },
    relativeStyle() {
      return typeof this.relative === 'string' ? this.relative : 'long'
    }
  }
})
</script>

<style>
.w-max {
  white-space: nowrap;
  width: max-content;
}
</style>


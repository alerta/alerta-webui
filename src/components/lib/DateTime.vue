<template>
  <v-tooltip top>
    <span
      slot="activator"
      class="text-no-wrap"
    >
      {{ value | date(displayMode, formatString) }}
    </span>
    <span>{{ value | date('utc', 'YYYY/MM/DD HH:mm:ss.SSS Z') }}</span>
  </v-tooltip>
</template>

<script>
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

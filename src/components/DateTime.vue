<template>
  <v-tooltip top>
    <span
      slot="activator"
      style="white-space: nowrap"
    >
      {{ value | date(formatString) }}
    </span>
    <span>{{ value | date('YYYY/MM/DD HH:mm:ss.SSS Z') }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    value: { type: String, required: true },
    format: { type: String, default: 'mediumDate' }
  },
  computed: {
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

<template>
  <v-container fluid>
    {{ application }}
    <pre>{{ metrics }}</pre>
    {{ time }}
    {{ uptime }}
    {{ version }}
  </v-container>
</template>

<script>
export default {
  computed: {
    application() {
      return this.$store.state.management.application
    },
    metrics() {
      return this.$store.state.management.metrics
    },
    time() {
      return this.$store.state.management.time
    },
    uptime() {
      return this.$store.state.management.uptime
    },
    version() {
      return this.$store.state.management.version
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    getStatus() {
      return this.$store.dispatch('management/getStatus')
    }
  }
}
</script>

<style></style>

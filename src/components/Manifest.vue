<template>
  <v-container fluid>
    {{ manifest }}
  </v-container>
</template>

<script>
export default {
  computed: {
    manifest() {
      return this.$store.state.management.manifest
    }
  },
  created() {
    this.getManifest()
  },
  methods: {
    getManifest() {
      return this.$store.dispatch('management/getManifest')
    }
  }
}
</script>

<style>
</style>

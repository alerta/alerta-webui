<template>
  <v-snackbar
    v-model="show"
    auto-height
    :color="snackbar.type"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.text }}
    <v-btn
      flat
      @click="close"
    >
      {{ snackbar.action }}
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  computed: {
    snackbar() {
      return this.$store.state.notifications.snackbars[0] || {}
    }
  },
  watch: {
    snackbar(newVal, oldVal) {
      if (!newVal.text) return
      this.show = true
    },
    show(val) {
      val || this.close()
    }
  },
  methods: {
    close() {
      this.show = false
      this.$store.dispatch('notifications/closeSnackbar')
    }
  }
}
</script>

<style>
</style>

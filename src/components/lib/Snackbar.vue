<template>
  <v-snackbar v-model="show" :color="snackbar.type" :timeout="snackbar.timeout">
    {{ snackbar.text | capitalize }}

    <template v-slot:action="{ attrs }">
      <v-btn outlined v-bind="attrs" @click="handleClick">
        {{ snackbar.action }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    show: false
  }),
  computed: {
    snackbar() {
      return this.$store.state.notifications.snackbars[0] || {}
    }
  },
  watch: {
    snackbar() {
      if (this.$store.getters['notifications/hasSnackbar'])
        this.$nextTick(() => (this.show = true))
    },
    show(val) {
      val || this.close()
    }
  },
  methods: {
    handleClick() {
      this.snackbar.callback?.()
      this.close()
    },
    close() {
      this.show = false
      this.$store.dispatch('notifications/closeSnackbar')
    }
  }
}
</script>

<style></style>

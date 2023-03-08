<template>
  <v-alert
    v-model="show"
    :type="banner.type"
    :icon="banner.icon"
    dismissible
    outlined
  >
    {{ banner.text }}
  </v-alert>
</template>

<script>
export default {
  data: () => ({
    show: false
  }),
  computed: {
    banner() {
      return this.$store.state.notifications.banners[0] || {}
    }
  },
  watch: {
    banner(newVal, oldVal) {
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
      this.$store.dispatch('notifications/closeBanner')
    }
  }
}
</script>

<style></style>

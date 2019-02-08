<template>
  <v-fab-transition>
    <v-btn
      key="add"
      color="accent"
      fab
      fixed
      bottom
      right
      @click="addToList"
    >
      <v-icon color="white">
        add
      </v-icon>
      <v-icon>close</v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script>
export default {
  methods: {
    addToList() {
      this.$emit('add-to-list')
    }
  }
}
</script>

<style></style>

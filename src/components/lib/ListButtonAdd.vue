<template>
  <v-fab-transition>
    <v-btn
      key="add"
      v-has-perms="perms"
      color="accent"
      fab
      fixed
      bottom
      end
      @click="addToList"
      class="mb-5"
    >
      <v-icon color="white">
        add
      </v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script>
export default {
  props: {
    perms: {
      type: String,
      required: true
    }
  },
  methods: {
    addToList() {
      this.$emit('add-to-list')
    }
  }
}
</script>

<style>
.v-icon {
  display: inline-flex !important;
}
</style>

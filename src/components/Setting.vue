<template>
  <v-container fluid>
    <v-switch
      value="true"
      :input-value="getValue()"
      :label="label"
      :hint="hint"
      persistent-hint
      @change="toggle($event !== null)"
    >
    </v-switch>
  </v-container>
</template>

<script>
export default {
  props: {
    switch: { type: String, required: true },
    label: { type: String, default: '' },
    hint: { type: String, default: '' }
  },
  methods: {
    toggle(value) {
      this.$store.dispatch('update', [this.switch, value])
    }
  },
  getters: {
    getValue() {
      return this.$store.state[this.switch]
    }
  }
}
</script>

<style>
</style>

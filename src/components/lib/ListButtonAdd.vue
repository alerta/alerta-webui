<template>
  <!-- fab removed; no longer supported -->
  <v-fab-transition>
    <div>
      <div style="padding-top: 2px;"/>
      <v-btn
      key="add"
      v-has-perms="perms"
      color="#eeeeee"
      fixed
      location="bottom"
      end
      @click="addToList"
      class="mb-5"
    > 
      <v-icon>
        add
      </v-icon>
    </v-btn>
    </div>
    
   
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

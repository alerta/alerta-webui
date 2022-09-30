<template>
  <div class="alert">
    <alert-detail :id="id" @close="close()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AlertDetail from '@/components/AlertDetail.vue'

export default Vue.extend({
  components: {
    AlertDetail
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    close() {
      const fromIncident = this.$route.query['from-incident']
      if (fromIncident && typeof fromIncident === 'string') {
        this.$router.push({
          name: 'incident',
          params: { id: fromIncident }
        })
      } else {
        this.$router.push({
          name: 'alerts',
          hash: this.$store.getters['alerts/getHash']
        })
      }
    }
  }
})
</script>

<template>
  <div class="alert">
    <alert-detail
      :id="id"
      @close="$router.push({ name: 'alerts' })"
    />
  </div>
</template>

<script>
import AlertDetail from '@/components/AlertDetail.vue'

export default {
  components: {
    AlertDetail
  },
  props: {
    id
  }
}
</script>

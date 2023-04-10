<template>
  <div class="about">
    <manifest />
    <status />
  </div>
</template>

<script>
import Manifest from '@/components/Manifest.vue'
import Status from '@/components/Status.vue'


export default {
  components: {
    Manifest,
    Status
  }
}
</script>

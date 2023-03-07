<template>
  <div class="about">
    <manifest />
    <status />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import Manifest from '@/components/Manifest.vue'
import Status from '@/components/Status.vue'

@Options({
  components: {
    Manifest,
    Status
  }
})
export default class About extends Vue {}
</script>

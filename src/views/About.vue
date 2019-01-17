<template>
  <div class="about">
    <manifest/>
    <status/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Manifest from '@/components/Manifest.vue'
import Status from '@/components/Status.vue'

@Component({
  components: {
    Manifest,
    Status
  }
})
export default class About extends Vue {}
</script>

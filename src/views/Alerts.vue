<template>
  <div class="alerts">
    <alert-list/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AlertList from '@/components/AlertList.vue'

@Component({
  components: {
    AlertList
  }
})
export default class Alerts extends Vue {}
</script>

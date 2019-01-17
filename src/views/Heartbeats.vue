<template>
  <div class="heartbeats">
    <heartbeat-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeartbeatList from '@/components/HeartbeatList.vue'

@Component({
  components: {
    HeartbeatList
  }
})
export default class Heartbeats extends Vue {}
</script>

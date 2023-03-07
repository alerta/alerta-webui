<template>
  <div class="heartbeats">
    <heartbeat-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import HeartbeatList from '@/components/HeartbeatList.vue'

@Options({
  components: {
    HeartbeatList
  }
})
export default class Heartbeats extends Vue {}
</script>

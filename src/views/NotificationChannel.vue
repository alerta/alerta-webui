<template>
  <div class="twiliorule">
    <notification-channel-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NotificationChannelList from '@/components/NotificationChannelList.vue'

@Component({
  components: {
    NotificationChannelList
  }
})
export default class NotificationChannel extends Vue {}
</script>

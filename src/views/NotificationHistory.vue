<template>
  <div class="notificationhistory">
    <notification-history-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NotificationHistoryList from '@/components/NotificationHistoryList.vue'

@Component({
  components: {
    NotificationHistoryList
  }
})
export default class NotificationHistory extends Vue {}
</script>

<template>
  <div class="notificationgroup">
    <notification-group-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NotificationGroupList from '@/components/NotificationGroupList.vue'

@Component({
  components: {
    NotificationGroupList,
  },
})
export default class NotificationGroup extends Vue {}
</script>

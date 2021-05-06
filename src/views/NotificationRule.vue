<template>
  <div class="twiliorule">
    <notification-rule-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NotificationRuleList from '@/components/NotificationRuleList.vue'

@Component({
  components: {
    NotificationRuleList
  }
})
export default class NotificationRule extends Vue {}
</script>

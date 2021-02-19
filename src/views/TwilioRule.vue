<template>
  <div class="twiliorule">
    <twilio-rule-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TwilioRuleList from '@/components/TwilioRuleList.vue'

@Component({
  components: {
    TwilioRuleList
  }
})
export default class TwilioRule extends Vue {}
</script>

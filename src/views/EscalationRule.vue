<template>
  <div class="escalationrule">
    <escalation-rule-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import EscalationRuleList from '@/components/EscalationRuleList.vue'

@Component({
  components: {
    EscalationRuleList
  }
})
export default class EscalationRule extends Vue {}
</script>

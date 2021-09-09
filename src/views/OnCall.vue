<template>
  <div class="oncall">
    <on-call-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import OnCallList from '@/components/OnCallList.vue'

@Component({
  components: {
    OnCallList,
  },
})
export default class OnCall extends Vue {}
</script>

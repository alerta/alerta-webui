<template>
  <div class="about">
    <top-offenders />
    <top-flapping />
    <top-standing />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TopOffenders from '@/components/reports/TopOffenders.vue'
import TopFlapping from '@/components/reports/TopFlapping.vue'
import TopStanding from '@/components/reports/TopStanding.vue'

@Component({
  components: {
    TopOffenders,
    TopFlapping,
    TopStanding
  }
})
export default class About extends Vue {}
</script>

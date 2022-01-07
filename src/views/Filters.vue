<template>
  <div class="filters">
    <filter-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FilterList from '@/components/FilterList.vue'

@Component({
  components: {
    FilterList
  }
})
export default class Filters extends Vue {}
</script>

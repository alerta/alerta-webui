<template>
  <div class="blackouts">
    <blackout-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BlackoutList from '@/components/BlackoutList.vue'

@Component({
  components: {
    BlackoutList
  }
})
export default class Blackouts extends Vue {}
</script>

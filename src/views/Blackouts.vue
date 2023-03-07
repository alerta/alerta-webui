<template>
  <div class="blackouts">
    <blackout-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import BlackoutList from '@/components/BlackoutList.vue'

@Options({
  components: {
    BlackoutList
  }
})
export default class Blackouts extends Vue {}
</script>

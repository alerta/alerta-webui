<template>
  <div class="groups">
    <group-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import GroupList from '@/components/GroupList.vue'

@Options({
  components: {
    GroupList
  }
})
export default class Groups extends Vue {}
</script>

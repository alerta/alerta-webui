<template>
  <div class="perms">
    <perm-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'

import PermList from '@/components/PermList.vue'

@Options({
  components: {
    PermList
  }
})
export default class Perms extends Vue {}
</script>

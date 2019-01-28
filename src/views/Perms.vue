<template>
  <div class="perms">
    <perm-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import PermList from '@/components/PermList.vue'

@Component({
  components: {
    PermList
  }
})
export default class Perms extends Vue {}
</script>

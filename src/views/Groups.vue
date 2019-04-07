<template>
  <div class="groups">
    <group-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import GroupList from '@/components/GroupList.vue'

@Component({
  components: {
    GroupList
  }
})
export default class Groups extends Vue {}
</script>

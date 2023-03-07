<template>
  <div class="users">
    <user-list />
  </div>
</template>

<!-- Removed lang="ts" for now due to compiler errors -->
<script>
import { Vue, Options } from 'vue-class-component'
import UserList from '@/components/UserList.vue'

@Options({
  components: {
    UserList
  }
})
export default class Users extends Vue {}
</script>

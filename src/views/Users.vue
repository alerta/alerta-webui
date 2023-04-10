<template>
  <div class="users">
    <user-list />
  </div>
</template>

<!-- Removed lang="ts" for now due to compiler errors -->
<script>
import UserList from '@/components/UserList.vue'

export default {
  components: {
    UserList
  }
}
</script>

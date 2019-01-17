<template>
  <div class="users">
    <user-list/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserList from '@/components/UserList.vue'

@Component({
  components: {
    UserList
  }
})
export default class Users extends Vue {}
</script>

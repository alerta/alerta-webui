<template>
  <user-logout />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserLogout from '@/components/auth/UserLogout.vue'

@Options({
  components: {
    UserLogout
  }
})
export default class Logout extends Vue {}
</script>

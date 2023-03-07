<template>
  <user-login />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserLogin from '@/components/auth/UserLogin.vue'

@Options({
  components: {
    UserLogin
  }
})
export default class Login extends Vue {}
</script>

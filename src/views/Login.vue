<template>
  <user-login />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserLogin from '@/components/auth/UserLogin.vue'
import UserSignup from '@/components/auth/UserSignup.vue'

@Component({
  components: {
    UserLogin,
    UserSignup
  }
})
export default class Login extends Vue {}
</script>

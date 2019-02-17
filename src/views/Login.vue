<template>
  <user-login />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserLogin from '@/components/auth/UserLogin.vue'

@Component({
  components: {
    UserLogin
  }
})
export default class Login extends Vue {}
</script>

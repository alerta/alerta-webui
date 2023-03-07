<template>
  <user-signup />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserSignup from '@/components/auth/UserSignup.vue'

@Options({
  components: {
    UserSignup
  }
})
export default class Signup extends Vue {}
</script>

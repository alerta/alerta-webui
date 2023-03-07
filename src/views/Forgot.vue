<template>
  <user-forgot />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserForgot from '@/components/auth/UserForgot.vue'

@Options({
  components: {
    UserForgot
  }
})
export default class Forgot extends Vue {}
</script>

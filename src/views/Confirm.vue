<template>
  <user-confirm />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserConfirm from '@/components/auth/UserConfirm.vue'

@Options({
  components: {
    UserConfirm
  }
})
export default class Confirm extends Vue {}
</script>

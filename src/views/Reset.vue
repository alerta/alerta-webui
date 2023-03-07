<template>
  <user-reset />
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import UserReset from '@/components/auth/UserReset.vue'

@Options({
  components: {
    UserReset
  }
})
export default class Reset extends Vue {}
</script>

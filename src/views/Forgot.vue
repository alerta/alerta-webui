<template>
  <user-forgot />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserForgot from '@/components/auth/UserForgot.vue'

@Component({
  components: {
    UserForgot
  }
})
export default class Forgot extends Vue {}
</script>

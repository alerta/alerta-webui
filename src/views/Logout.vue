<template>
  <user-logout />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserLogout from '@/components/auth/UserLogout.vue'

@Component({
  components: {
    UserLogout
  }
})
export default class Logout extends Vue {}
</script>

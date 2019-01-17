<template>
  <user-signup/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserSignup from '@/components/auth/UserSignup.vue'

@Component({
  components: {
    UserSignup
  }
})
export default class Signup extends Vue {}
</script>

<template>
  <user-confirm />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserConfirm from '@/components/auth/UserConfirm.vue'

@Component({
  components: {
    UserConfirm
  }
})
export default class Confirm extends Vue {}
</script>

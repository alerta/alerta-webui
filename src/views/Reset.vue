<template>
  <user-reset/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserReset from '@/components/auth/UserReset.vue'

@Component({
  components: {
    UserReset
  }
})
export default class Reset extends Vue {}
</script>

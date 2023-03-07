<template>
  <div class="settings">
    <preferences />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import Preferences from '@/components/Preferences.vue'

@Options({
  components: {
    Preferences
  }
})
export default class Settings extends Vue {}
</script>

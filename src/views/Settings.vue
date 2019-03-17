<template>
  <div class="settings">
    <preferences />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Preferences from '@/components/Preferences.vue'

@Component({
  components: {
    Preferences
  }
})
export default class Settings extends Vue {}
</script>

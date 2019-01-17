<template>
  <div class="keys">
    <api-key-list/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ApiKeyList from '@/components/ApiKeyList.vue'

@Component({
  components: {
    ApiKeyList
  }
})
export default class ApiKeys extends Vue {}
</script>

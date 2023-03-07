<template>
  <div class="keys">
    <api-key-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import ApiKeyList from '@/components/ApiKeyList.vue'

@Options({
  components: {
    ApiKeyList
  }
})
export default class ApiKeys extends Vue {}
</script>

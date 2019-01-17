<template>
  <div class="customers">
    <customer-list/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CustomerList from '@/components/CustomerList.vue'

@Component({
  components: {
    CustomerList
  }
})
export default class Customers extends Vue {}
</script>

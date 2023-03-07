<template>
  <div class="customers">
    <customer-list />
  </div>
</template>

<script>
import { Vue, Options } from 'vue-class-component'
import CustomerList from '@/components/CustomerList.vue'

@Options({
  components: {
    CustomerList
  }
})
export default class Customers extends Vue {}
</script>

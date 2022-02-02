<template>
  <div class="alert">
    <alert-detail :id="id" @close="$router.push({ name: 'alerts' })" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import AlertDetail from '@/components/AlertDetail.vue'

@Component({
  components: {
    AlertDetail
  }
})
export default class Alert extends Vue {
  @Prop() public id!: string
}
</script>

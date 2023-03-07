<template>
  <div class="alert">
    <alert-detail
      :id="id"
      @close="$router.push({ name: 'alerts' })"
    />
  </div>
</template>

<script lang="ts">
import { Prop } from 'vue-property-decorator'
import { Vue, Options } from 'vue-class-component'
import AlertDetail from '@/components/AlertDetail.vue'

@Options({
  components: {
    AlertDetail
  }
})
export default class Alert extends Vue {
  @Prop() public id!: string
}
</script>

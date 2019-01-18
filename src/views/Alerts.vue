<template>
  <div class="alerts">

    <v-tabs
      align-with-title
      grow
    >
      <v-tabs-slider></v-tabs-slider>

      <v-tab
        v-for="env in environments"
        :key="env"
        :href="'#tab-' + env"
        @click="setTab(env)"
      >
        {{ env }}
      </v-tab>

      <v-tabs-items>
        <v-tab-item
          v-for="env in environments"
          :key="env"
          :value="'tab-' + env"
          :transition="false" :reverse-transition="false"
        >
          <alert-list :filter="filter"/>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    
  </div>
</template>

<script>
import AlertList from '@/components/AlertList.vue'

export default {
  components: {
    AlertList
  },
  data: () => ({
    currentTab: 'ALL',
    filter: null
  }),
  computed: {
    environments() {
      return ['ALL'].concat(this.$store.getters['alerts/environments'])
    }
  },
  created() {
    this.getEnvironments()
    // this.getServices()
    // this.getTags()
  },
  methods: {
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    setTab(env) {
      if (env === 'ALL') {
        this.filter = null
      } else {
        this.filter = { environment: env }
      }
    }
  }
}
</script>

<style>
</style>

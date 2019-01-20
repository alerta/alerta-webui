<template>
  <div class="alerts">

    <v-tabs
      align-with-title
      grow
    >
      <v-tabs-slider></v-tabs-slider>

      <v-tab
        v-for="env in environments"
        :key="env.environment"
        :href="'#tab-' + env.environment"
        @click="setTab(env.environment)"
      >
        {{ env.environment }} ({{ env.count }})
      </v-tab>

      <v-tabs-items>
        <v-tab-item
          v-for="env in environments"
          :key="env.environment"
          :value="'tab-' + env.environment"
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
      let e = this.$store.state.alerts.environments
      let totalCount = e.map(e => e.count).reduce((a, b) => a + b, 0)
      return [{ environment: 'ALL', count: totalCount }].concat(e)
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

<template>
  <div class="alerts">

    <audio v-if="playSound && !isMute" :src="$config.audio.new" autoplay></audio>

    <alert-list-filter
      :value="sidesheet"
      @set-status="setStatus"
      @set-service="setService"
      @close="sidesheet = false"
    />

    <v-tabs grow>
      <v-tabs-slider></v-tabs-slider>
      <v-tab
        v-for="env in environments"
        :key="env.environment"
        :href="'#tab-' + env.environment"
        @click="setEnv(env.environment)"
      >
        <v-badge color="grey">
          <span slot="badge">{{ env.count }}</span>
          {{ env.environment }}&nbsp;
        </v-badge>
      </v-tab>
      <v-spacer></v-spacer>
      <v-btn
        flat
        icon
        @click="sidesheet = !sidesheet"
      >
        <v-icon>filter_list</v-icon>
      </v-btn>
      <span class="pr-2"></span>

      <v-tabs-items>
        <v-tab-item
          v-for="env in environments"
          :key="env.environment"
          :value="'tab-' + env.environment"
          :transition="false" :reverse-transition="false"
        >
          <alert-list
            :filter="filter"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

  </div>
</template>

<script>
import AlertList from '@/components/AlertList.vue'
import AlertListFilter from '@/components/AlertListFilter.vue'

export default {
  components: {
    AlertList,
    AlertListFilter
  },
  data: () => ({
    currentTab: 'ALL',
    sidesheet: false,
    filter: {
      environment: null,
      service: null,
      status: null
    },
    playSound: false
  }),
  computed: {
    environments() {
      let e = this.$store.state.alerts.environments
      let totalCount = e.map(e => e.count).reduce((a, b) => a + b, 0)
      return [{ environment: 'ALL', count: totalCount }].concat(e)
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
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
    setEnv(env) {
      this.filter = Object.assign({}, this.filter, { environment: env === 'ALL' ? null : env })
    },
    setService(svc) {
      this.filter = Object.assign({}, this.filter, { service: svc.length > 0 ? svc : null })
    },
    setStatus(st) {
      this.filter = Object.assign({}, this.filter, { status: st.length > 0 ? st : null })
    }
  }
}
</script>

<style>
</style>

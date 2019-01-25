<template>
  <div class="alerts">
    <audio v-if="playSound && !isMute" :src="$config.audio.new" autoplay></audio>

    <alert-list-filter
      :value="sidesheet"
      :filter="filter"
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
          <span slot="badge">{{ environmentCounts[env.environment] || 0 }}</span>
          {{ env.environment }}&nbsp;
        </v-badge>
      </v-tab>
      <v-spacer></v-spacer>
  <v-btn
        color="purple"
        dark
        @click="sheet = true"
      >
        Click me
      </v-btn>
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
            :alerts="alerts"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    <v-bottom-sheet v-model="sheet">
      <v-list>
        <v-list-tile>
        <v-btn
            color="green"
            class="white--text"
            @click="takeAction('open')"
          >
            <v-icon>refresh</v-icon>&nbsp;Open
          </v-btn>
        </v-list-tile>

        <v-list-tile @click="takeAction('open')">
          <v-list-tile-avatar>
            <v-icon>refresh</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-title>Open</v-list-tile-title>
        </v-list-tile>


        <v-list-tile
          v-for="tile in tiles"
          :key="tile.title"
          @click="sheet = false"
        >
          <v-list-tile-avatar>
            <v-avatar size="32px" tile>
              <img
                :src="`https://cdn.vuetifyjs.com/images/bottom-sheets/${tile.img}`"
                :alt="tile.title"
              >
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>{{ tile.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>

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
      status: ['open', 'ack']
    },
    playSound: false,
         sheet: false,
      tiles: [
        { img: 'keep.png', title: 'Keep' },
        { img: 'inbox.png', title: 'Inbox' },
        { img: 'hangouts.png', title: 'Hangouts' },
        { img: 'messenger.png', title: 'Messenger' },
        { img: 'google.png', title: 'Google+' }
      ],
      actions: [
        { title: 'Action1', icon: 'build', color: 'primary'},
        { title: 'Action2', icon: 'build', color: 'secondary'},
        { title: 'Action3', icon: 'build', color: 'accent'}
      ]
  }),
  computed: {
    environments() {
      let e = this.$store.state.alerts.environments
      let totalCount = e.map(e => e.count).reduce((a, b) => a + b, 0)
      return [{ environment: 'ALL', count: totalCount }].concat(e)
    },
    environmentCounts() {
      return this.alerts.reduce((grp, a) => {
        grp[a.environment] = grp[a.environment] + 1 || 1
        grp['ALL'] = grp['ALL'] + 1 || 1
        return grp
      }, {})
    },
    alerts() {
      if (this.filter) {
        return this.$store.getters['alerts/alerts']
          .filter(
            alert =>
              this.filter.environment
                ? alert.environment === this.filter.environment
                : true
          )
          .filter(
            alert =>
              this.filter.service
                ? alert.service.some(x => this.filter.service.includes(x))
                : true
          )
          .filter(
            alert =>
              this.filter.status
                ? this.filter.status.includes(alert.status)
                : true
          )
      } else {
        return this.$store.getters['alerts/alerts']
      }
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    },
    autoRefresh() {
      return true // FIXME: autoRefresh setting comes from server in alert response
    },
    refresh() {
      return this.$store.state.refresh
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    }
  },
  watch: {
    alerts(current, old) {
      if (
        old &&
        current.length > old.length &&
        this.filter.status &&
        this.filter.status.includes('open')
      ) {
        this.playSound = true
      } else {
        this.playSound = false
      }
    },
    refresh(val) {
      val || this.getAlerts()
    }
  },
  created() {
    this.getEnvironments()
    this.getAlerts()
    if (this.autoRefresh) {
      this.timer = setInterval(() => this.getAlerts(), this.refreshInterval)
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    getAlerts() {
      this.$store.dispatch('alerts/getAlerts')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    setEnv(env) {
      this.filter = Object.assign({}, this.filter, {
        environment: env === 'ALL' ? null : env
      })
    },
    setService(svc) {
      this.filter = Object.assign({}, this.filter, {
        service: svc.length > 0 ? svc : null
      })
    },
    setStatus(st) {
      this.filter = Object.assign({}, this.filter, {
        status: st.length > 0 ? st : null
      })
    }
  }
}
</script>

<style>
</style>
